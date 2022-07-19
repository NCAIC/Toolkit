import path from "node:path";
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { OptionValues, Command } from "commander";
import { compile } from "../../compile";
import { runner } from "../../runner";

export default async function test(source: string, opts: OptionValues, cmd: Command) {
    if (typeof source !== "string") {
        const team_path = path.resolve(process.cwd(), "team.json");
        if (fs.existsSync(team_path)) {
            source = JSON.parse(fs.readFileSync(team_path, "utf8")).program;
        }
    }

    source = path.resolve(process.cwd(), source);

    if (!fs.existsSync(source)) {
        console.error(`Source file ${source} not found`);
        process.exit(1);
    }

    console.log(`Testing ${source}`);
    const exe = compile(source);
    const dir = path.dirname(exe);

    const board = Array.from({ length: 15 }, () => Array.from({ length: 15 }, () => 0));
    board[0][0] = 1;
    board[0][1] = 2;

    const run = runner(exe);

    if (process.env.VERBOSE) {
        console.log(`Running: ${run}`);
    }

    const output = spawnSync(run, {
        shell: true,
        encoding: "utf8",
        input: `${board.flat().join(", ")}, 1, 123.321`,
        timeout: 120_000,
        stdio: ["pipe", "pipe", "inherit"],
        cwd: dir,
    });

    if (!output.stdout) {
        throw new Error("No output");
    }

    const [x, y] = output.stdout.split(" ").map((n) => parseInt(n, 10));
    if (
        x === undefined ||
        y === undefined ||
        x < 0 ||
        x >= 15 ||
        y < 0 ||
        y >= 15 ||
        board[x][y] !== 0
    ) {
        throw new Error("Invalid Output. Received: " + output.stdout);
    }

    console.log("Test Passed.");

    fs.rmSync(dir, { recursive: true });
}
