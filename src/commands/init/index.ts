import path from "node:path";
import fs from "node:fs";
import yaml from "js-yaml";
import { Command, OptionValues } from "commander";
import { Config } from "../../types";

export default function init(opts: OptionValues, cmd: Command) {
    const config_path = path.resolve(process.cwd(), opts.path);
    if (fs.existsSync(config_path)) {
        console.error(`Config file ${config_path} already exists.`);
        process.exit(1);
    }

    fs.writeFileSync(
        config_path,
        yaml.dump(
            {
                teams: {
                    "Team A": null,
                    "Team B": null,
                },
                delay: { step: 200, set: 2_000 },
                competition: {
                    rule: "double-sided",
                    matches: [
                        { type: "empty" },
                        { type: "random", count: 4 },
                        { type: "random", count: 8, ext: true },
                    ],
                    timeout: { step: 999_999_999, set: 999_999_999 },
                },
            } as Config,
            { indent: 4 },
        ),
    );

    console.log(`Config file ${config_path} created.`);
    process.exit(0);
}
