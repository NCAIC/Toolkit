import path from "node:path";
import fs from "node:fs";
import { execSync } from "node:child_process";
import { OptionValues, Command } from "commander";

export default function setup(opts: OptionValues, cmd: Command) {
    console.log("Setting up ...");

    const dir = path.resolve(__dirname, "..", "env", "rs");
    try {
        execSync("cargo build --release --bin agent", {
            cwd: dir,
            stdio: process.env.VERBOSE ? "inherit" : "ignore",
        });
        fs.rmSync(path.resolve(dir, "target", "release", "agent"));
    } catch (err) {
        if (process.env.VERBOSE) {
            console.error(
                `Rust deps pre-build failed, but it should not be a problem: ${
                    (err as Error).message
                }`,
            );
        }
    }

    console.log("Setup complete.");
}
