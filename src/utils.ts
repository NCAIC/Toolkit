import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import pidusage from "pidusage";

/**
 * Deeply clones an object, using JSON serialization and deserialization.
 * @param obj The object to be copied.
 * @returns The copied object.
 */
export function copy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Asks the user for a string input from the terminal.
 * @param question The question to be asked.
 * @param source The IO sources.
 * @returns The user's input.
 */
export function ask(
    question: string,
    { input = process.stdin, output = process.stdout } = {},
): Promise<string> {
    const io = createInterface({ input, output });
    let resolve: (value: string) => void;
    let reject: (reason: any) => void;
    let answer: string;
    const promise = new Promise<string>((res, rej) => ([resolve, reject] = [res, rej]));

    io.on("close", () => (typeof answer === "string" ? resolve(answer) : reject("")));

    io.question(question, (ans) => {
        answer = ans.trim();
        io.close();
    });

    return promise;
}

/**
 * Wait for a given amount of time.
 * @param ms The number of milliseconds to wait.
 * @param val The value to return.
 * @returns A promise that resolves after the given amount of time.
 */
export function sleep<T>(ms: number): Promise<undefined>;
export function sleep<T>(ms: number, val: T): Promise<T>;
export function sleep<T>(ms: number, val?: T): Promise<T | undefined> {
    return new Promise<T | undefined>((resolve) => setTimeout(() => resolve(val), ms));
}

/**
 * Creates a random string of a given length.
 * @param length The length of the string.
 * @param chars The characters to use.
 * @returns The random string.
 */
export function random_string(
    length: number,
    chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
): string {
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

/**
 * Generates string from literal template and given variables.
 * @param template The literal template to use.
 * @param vars The variables to inject.
 * @returns The formatted string.
 */
export function Template(template: string, vars: Record<string, any>): Promise<string> {
    return new (Object.getPrototypeOf(async function () {}).constructor)(
        ...Object.keys(vars),
        "return `" + template.replace(/`/g, "\\`") + "`",
    )(...Object.values(vars));
}

/**
 * Get complimentary color of a given color.
 * @param hex The hex color to get the complimentary color of.
 * @returns The complimentary color.
 */
export function complimentary(hex: string): string {
    const [r, g, b] = hex
        .toLowerCase()
        .match(/[0-9a-f]{2}/g)!
        .map((x) => parseInt(x, 16) / 255);

    // Convert RGB to HSL
    // Adapted from answer by 0x000f http://stackoverflow.com/a/34946092/4939630
    const [min, mid, max] = [r, g, b].sort((a, b) => a - b);
    let h = 0,
        s = 0,
        l = (max + min) / 2.0;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2.0 - max - min) : d / (max + min);

        if (max == r && g >= b) {
            h = (1.0472 * (g - b)) / d;
        } else if (max == r && g < b) {
            h = (1.0472 * (g - b)) / d + 6.2832;
        } else if (max == g) {
            h = (1.0472 * (b - r)) / d + 2.0944;
        } else if (max == b) {
            h = (1.0472 * (r - g)) / d + 4.1888;
        }
    }

    h = (h / 6.2832) * 360.0;

    // Shift hue to opposite side of wheel and convert to [0-1] value
    h += 180;
    if (h > 360) {
        h -= 360;
    }
    h /= 360;

    // Convert h s and l values into r g and b values
    // Adapted from answer by Mohsen http://stackoverflow.com/a/9493060/4939630
    let [new_r, new_g, new_b] = [0, 0, 0];
    if (s === 0) {
        new_r = new_g = new_b = l; // achromatic
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        new_r = hue2rgb(p, q, h + 1 / 3);
        new_g = hue2rgb(p, q, h);
        new_b = hue2rgb(p, q, h - 1 / 3);
    }

    new_r = Math.round(new_r * 255);
    new_g = Math.round(new_g * 255);
    new_b = Math.round(new_b * 255);

    const rgb = new_b | (new_g << 8) | (new_r << 16);
    return "#" + (0x1000000 | rgb).toString(16).substring(1);
}

/**
 * Run a command and return the output.
 * @param command The command to run.
 * @param args The arguments to pass to the command.
 * @param options The options to pass to child_process.spawn, with the following additions:
 * - `memory`: The memory limit in MB.
 * - `interval`: The interval in milliseconds to check for memory usage.
 */
export function run(
    command: string,
    args: string[],
    options: Parameters<typeof spawn>["2"] & {
        memory?: number;
        interval?: number;
        input?: string;
        light?: boolean;
    } = {},
): Promise<{
    output: string;
    time: number;
    memory: number;
    cpu: number;
}> {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, options);

        const start_time = Date.now();

        let output = "";
        child.stdout?.on("data", (data) => (output += data.toString()));
        child.stderr?.on("data", (data) => (output += data.toString()));

        let max_memory = 0,
            max_cpu = 0;
        let interval = setInterval(
            async () => {
                if (child.pid && child.killed === false && !options.light) {
                    try {
                        const stats = await pidusage(child.pid);
                        const mem = Math.ceil(stats.memory / 1024 / 1024);

                        if (mem > max_memory) {
                            max_memory = mem;
                        }

                        if (stats.cpu > max_cpu) {
                            max_cpu = stats.cpu;
                        }

                        if (options.memory && mem > options.memory) {
                            child.kill();
                            reject(`Memory Usage Exceeded (${mem} MB > ${options.memory} MB)`);
                        }
                    } catch {}
                } else {
                    clearInterval(interval);
                }
            },
            options.interval && options.interval > 0 ? options.interval : 200,
        );

        child.on("error", reject);
        child.on("exit", (code) => {
            interval && clearInterval(interval);
            const time = Date.now() - start_time;
            return code === 0
                ? resolve({ output, time, memory: max_memory, cpu: max_cpu })
                : reject(output);
        });

        if (options.input) {
            child.stdin?.write(options.input);
            child.stdin?.end();
        }
    });
}
