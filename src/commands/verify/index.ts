import fs from "node:fs";
import path from "node:path";
import { OptionValues, Command } from "commander";
import { array, boolean, object, string } from "yup";
import { setLocale } from "./yup";

export default async function verify(opts: OptionValues, cmd: Command) {
    setLocale("zh");

    const team_schema = object({
        register: opts.strict ? boolean().required().isTrue() : boolean().required(),
        name: string().required().min(1).max(80),
        org: string().defined().min(0).max(80),
        members: array()
            .of(
                object({
                    name: string().required(),
                    email: string().email(),
                    github: string(),
                }).required(),
            )
            .min(1)
            .max(100)
            .required(),
        program: string().required().min(1).max(160),
    }).required();

    const team_path = path.resolve(process.cwd(), opts.path);
    if (!fs.existsSync(team_path)) {
        console.error(`檔案 ${team_path} 不存在`);
        process.exit(1);
    }

    let team_json;
    try {
        team_json = JSON.parse(fs.readFileSync(team_path, "utf8"));
    } catch (err) {
        console.error(`${team_path} 不是合法的 JSON 檔案`);
        process.exit(1);
    }

    try {
        await team_schema.validate(team_json);
    } catch (err) {
        console.error((err as Error).message);
        process.exit(1);
    }

    console.log(`${team_path} 檔案格式正確`);
}
