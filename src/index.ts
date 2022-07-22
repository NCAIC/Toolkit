#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import * as commander from "commander";
import check from "./commands/check";
import init from "./commands/init";
import verify from "./commands/verify";
import test from "./commands/test";
import run from "./commands/run";
import env from "./commands/env";
import perf from "./commands/perf";

const package_info = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"),
);

const program = new commander.Command().version(`${package_info.name} ${package_info.version}`);

program.command("check").description("check for language support").action(check);
program.command("perf").description("run performance tests").action(perf);

program
    .command("env")
    .description("list created all environments")
    .option("-r, --remove", "remove all environments after listing")
    .action(env);

program
    .command("init")
    .description("create a config file")
    .option("-p, --path <path>", "path to the config file", "config.yml")
    .action(init);

program
    .command("verify")
    .description("verify a team.json file")
    .option("-p, --path <path>", "path to the team.json file", "team.json")
    .option("-s, --strict", "also check if value of register is true")
    .action(verify);

program
    .command("test")
    .description("test if a program can run without crashing")
    .argument("[source]", "path to the source file")
    .action(test);

program
    .command("run")
    .description("run a competition")
    .option("-c, --config <path>", "path to the config file", "config.yml")
    .option(
        "-o, --output <path>",
        "path to the output file",
        "competitions/${team_a}-${team_b}-${time}.json",
    )
    .action(run);

program.parse(process.argv);
