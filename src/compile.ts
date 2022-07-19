import fs from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

/**
 * Compile or transpile a program to an executable.
 * @param source The absolute path of the source file to compile.
 * @returns The absolute path of the compiled executable.
 */
export function compile(source: string) {
    source = path.resolve(process.cwd(), source);

    const dir = create_env(source);

    const commands: Record<string, string> = {
        c: `gcc --std=c11 -lm -O2 -o agent ${source}`,
        cpp: `g++ --std=c++11 -lm -O2 -o agent ${source}`,
        go: `go build -o agent ${source}`,
        js: `mv ${path.resolve(dir, path.basename(source))} agent.js`,
        py: `mv ${path.resolve(dir, path.basename(source))} agent.py`,
        rs: `cargo build --release --bin agent && mv target/release/agent agent`,
        ts: `esbuild --bundle --platform=node --outfile=agent.js ${source}`,
    };

    const ext = path.extname(source).slice(1);
    if (ext in commands) {
        const command = commands[ext];
        if (process.env.VERBOSE) {
            console.log(`Running: ${command}`);
        }
        spawnSync(command, {
            cwd: dir,
            shell: true,
            stdio: process.env.VERBOSE ? "inherit" : "ignore",
        });
    } else if (process.env.VERBOSE) {
        console.log(`No compile (transpile) command is required for ${ext}`);
    }

    const exe: Record<string, string> = {
        c: path.join(dir, "agent"),
        cpp: path.join(dir, "agent"),
        go: path.join(dir, "agent"),
        js: path.join(dir, "agent.js"),
        py: path.join(dir, "agent.py"),
        rs: path.join(dir, "agent"),
        ts: path.join(dir, "agent.js"),
    };

    if (ext in exe) {
        if (process.env.VERBOSE) {
            console.log(`Executable: ${exe[ext]}`);
        }

        return exe[ext];
    } else {
        throw new Error(`No executable for ${ext}`);
    }
}

/**
 * Create a temporary directory for the given source type.
 * @param source The absolute path of the source file to be checked.
 * @returns The absolute path of the temporary directory.
 */
export function create_env(source: string) {
    const dir = path.resolve(tmpdir(), Math.random().toString().slice(2));
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true });
    }
    fs.mkdirSync(dir, { recursive: true });

    if (process.env.VERBOSE) {
        console.log(`Created temp directory ${dir}`);
    }

    const ext = path.extname(source).slice(1);
    const env = path.resolve(__dirname, "..", "env", ext);
    if (!fs.existsSync(env)) {
        throw new Error(`Language extension "${ext}" is not supported.`);
    }

    // copy env directory to temp directory
    fs.cpSync(env, dir, { recursive: true });

    if (process.env.VERBOSE) {
        console.log(`Copied ${env} to ${dir}`);
    }

    // copy source file to temp directory
    fs.cpSync(source, path.resolve(dir, path.basename(source)));

    if (process.env.VERBOSE) {
        console.log(`Copied source file ${source} to ${dir}`);
    }

    // run post script if it exists
    const post: Record<string, string> = {
        rs: `mv -f ${path.resolve(dir, path.basename(source))} src/main.rs`,
    };

    if (ext in post) {
        const command = post[ext];
        if (process.env.VERBOSE) {
            console.log(`Running Post Script: ${command}`);
        }
        spawnSync(command, {
            cwd: dir,
            shell: true,
            stdio: process.env.VERBOSE ? "inherit" : "ignore",
        });
    }

    return dir;
}
