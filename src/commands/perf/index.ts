import path from "node:path";
import fs from "node:fs";
import { execSync } from "node:child_process";
import { OptionValues, Command } from "commander";
import { compile } from "../../compile";
import { run_exe } from "../../runner";

const compiled = new Map<string, string>();

export default async function check(opts: OptionValues, cmd: Command) {
    console.log("Running Performance Tests ...");

    const dir = path.resolve(__dirname, "..", "programs");

    const languages = {
        JavaScript: test(path.resolve(dir, "rand_x.js")),
        TypeScript: test(path.resolve(dir, "rand_x.ts")),
        C: test(path.resolve(dir, "rand_x.c")),
        "C++": test(path.resolve(dir, "rand_x.cpp")),
        Python: test(path.resolve(dir, "rand_x.py")),
        Go: test(path.resolve(dir, "rand_x.go")),
        Rust: test(path.resolve(dir, "rand_x.rs")),
    } as const;

    for (const [key, checker] of Object.entries(languages)) {
        try {
            let total = 0;
            for (let i = 0; i < 5; i++) {
                const result = await checker();
                if (i >= 2) {
                    total += result;
                }
            }
            console.log(`  ${key.padStart(10)} : ${(total / 3).toFixed(2)} ms`);
        } catch (err) {
            console.log(`  ${key.padStart(10)} : Failed (${(err as Error).message})`);
        }
    }

    for (const exe in compiled) {
        fs.rmSync(path.dirname(exe), { recursive: true });
    }
}

function test(source: string) {
    return async () => {
        if (!compiled.has(source)) {
            const exe = compile(source);
            compiled.set(source, exe);
        }

        const exe = compiled.get(source);

        if (exe) {
            const dir = path.dirname(exe);
            const run = run_exe(exe, { cwd: dir, stdio: "ignore" });
            const { time } = await run();

            return time;
        } else {
            throw new Error("Compilation failed");
        }
    };
}
