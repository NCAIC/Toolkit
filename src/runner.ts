import path from "node:path";
import { run } from "./utils";

export const runners: Record<string, string> = {
    "": process.platform === "win32" ? ".\\agent.exe" : `./agent`,
    js: `node agent.js`,
    py: `python -B agent.py`,
} as const;

/**
 * Find a command to run the given executable.
 * @param exe The absolute path of the executable to run.
 * @returns The command to run the executable.
 */
export function runner(exe: string) {
    const ext = path.extname(exe).slice(1);

    if (runners[ext] === undefined) {
        throw new Error(`Unknown runner for ${ext}`);
    }

    return runners[ext];
}

/**
 * Generate a function to run the given executable.
 * @param exe The absolute path of the executable to run.
 * @param options The options to pass to the spawn function.
 * @returns The function to call.
 */
export function run_exe(exe: string, options: Parameters<typeof run>["2"] = { memory: 1024 }) {
    const command = runner(exe);
    const cmds = command.split(" ");
    return () => run(cmds[0], cmds.slice(1), options);
}
