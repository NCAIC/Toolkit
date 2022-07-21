import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { OptionValues, Command } from "commander";

export default async function env(opts: OptionValues, cmd: Command) {
    const envs = fs.readdirSync(os.tmpdir()).filter((x) => x.startsWith("ncaic-"));

    if (envs.length) {
        const padding = Math.log10(envs.length) + 1;
        for (let i = 0; i < envs.length; i++) {
            const dir = path.resolve(os.tmpdir(), envs[i]);
            console.log(`${(i + 1).toString().padStart(padding)}. ${dir}`);
        }

        if (opts.remove) {
            console.log("---");
            for (let i = 0; i < envs.length; i++) {
                const dir = path.resolve(os.tmpdir(), envs[i]);
                fs.rmSync(dir, { recursive: true });
                console.log(`Removed ${dir}`);
            }
        }
    } else {
        console.log("No environments found");
    }
}
