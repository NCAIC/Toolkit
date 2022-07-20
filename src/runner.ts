import path from "node:path";

export const runners: Record<string, string> = {
    "": process.platform === "win32" ? ".\\agent" : `./agent`,
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
