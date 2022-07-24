import path from "node:path";
import fs from "node:fs";
import yaml from "js-yaml";
import { OptionValues, Command } from "commander";
import { tunnel } from "cloudflared";
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

    const port = opts.port || 52022;

    const result = server(config, { port });

    let server_tunnel: ReturnType<typeof tunnel> | undefined;
    if (opts.expose) {
        server_tunnel = tunnel({ url: `http://localhost:${port}` });
        const url = await server_tunnel.url;
        console.log(`Establishing Secure Tunnel ...`);
        const connections = await Promise.all(server_tunnel.connections);
        console.log(`Secure Tunnel Established.`);
        console.log(`  URL: ${url}`);
        console.log(`  Connections:`);
        for (const connection of connections) {
            console.log(
                `    [${connection.location}] ${connection.ip.padEnd(15)} - ${connection.id}`,
            );
        }
        console.log("---");
        console.log(
            `\x1b[95mFor spectators around the world: https://game.ncaic.cc/?url=${url.replace(
                "https",
                "wss",
            )}\x1b[m`,
        );
        console.log("---");
    }

    const [team_a, team_b] = Object.keys(config.teams);
    const output = await Template(opts.output, { team_a, team_b, time });

    if (!fs.existsSync(path.dirname(output))) {
        fs.mkdirSync(path.dirname(output), { recursive: true });
    }

    fs.writeFileSync(output, JSON.stringify(await result));

    for (const dir of dirs) {
        fs.rmSync(dir, { recursive: true });
    }

    if (server_tunnel) {
        server_tunnel.stop();
    }

    process.exit(0);
}
