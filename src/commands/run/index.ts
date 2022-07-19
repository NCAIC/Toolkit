import path from "node:path";
import fs from "node:fs";
import yaml from "js-yaml";
import { OptionValues, Command } from "commander";
import { Config } from "../../types";
import { server } from "../../server";
import { compile } from "../../compile";
import { Template } from "../../utils";

export default async function run(opts: OptionValues, cmd: Command) {
    if (typeof opts.config !== "string") {
        throw new Error("Config file path is not a string.");
    }

    const config_path = path.resolve(process.cwd(), opts.config);
    const config = yaml.load(fs.readFileSync(config_path, "utf8")) as Config;
    const time = Date.now();

    const dirs: string[] = [];

    for (const name in config.teams) {
        if (typeof config.teams[name].source === "string" && config.teams[name].source?.length) {
            config.teams[name].source = path.resolve(
                process.cwd(),
                config.teams[name].source as string,
            );

            if (!fs.existsSync(config.teams[name].source as string)) {
                console.error(`Source file ${config.teams[name].source} not found`);
                process.exit(1);
            }

            console.log(`Compiling ${config.teams[name].source}`);
            try {
                const exe = compile(config.teams[name].source as string);
                config.teams[name].source = exe;
                dirs.push(path.dirname(config.teams[name].source as string));

                console.log(`Compiled ${config.teams[name].source}`);
            } catch (err) {
                console.error(`Error compiling program of ${name}`, (err as Error).message);
                process.exit(1);
            }
        }
    }

    console.log({ dirs });

    const result = await server(config);

    const [team_a, team_b] = Object.keys(config.teams);
    const output = await Template(opts.output, { team_a, team_b, time });

    if (!fs.existsSync(path.dirname(output))) {
        fs.mkdirSync(path.dirname(output), { recursive: true });
    }

    fs.writeFileSync(output, JSON.stringify(result));

    for (const dir of dirs) {
        fs.rmSync(dir, { recursive: true });
    }

    process.exit(0);
}
