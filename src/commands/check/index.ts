import { execSync } from "node:child_process";
import { OptionValues, Command } from "commander";
import semver from "semver-regex";

const cache = new Map<string, string | undefined>();

export default function check(opts: OptionValues, cmd: Command) {
    console.log("Checking for language support ...");

    const languages = {
        JavaScript: check_js_version,
        TypeScript: check_ts_version,
        C: check_c_version,
        "C++": check_cpp_version,
        Python: check_python_version,
        Go: check_go_version,
        Rust: check_rust_version,
    } as const;

    for (const [key, checker] of Object.entries(languages)) {
        const result = checker();
        console.log(
            `  ${key.padStart(10)} : ${result ? "OK" : "X"}` + (result ? ` (${result})` : ""),
        );
    }
}

export function check_js_version() {
    try {
        if (!cache.has("js")) {
            const raw = run("node --version");
            const result = semver().exec(raw)?.[0];
            if (result) {
                cache.set("js", "node " + result);
            }
        }

        return cache.get("js");
    } catch (err) {
        return undefined;
    }
}

export function check_ts_version() {
    try {
        if (!cache.has("ts")) {
            const js = check_js_version();

            if (js) {
                const raw = run("esbuild --version");
                const result = semver().exec(raw)?.[0];
                if (result) {
                    cache.set("ts", js + ", esbuild " + result);
                }
            }
        }

        return cache.get("ts");
    } catch (err) {
        return undefined;
    }
}

export function check_c_version() {
    try {
        if (!cache.has("c")) {
            const raw = run("gcc --version").split("\n")[0];
            const result = semver().exec(raw)?.[0];
            if (result) {
                cache.set("c", (raw.includes("clang") ? "clang " : "gcc ") + result);
            }
        }

        return cache.get("c");
    } catch (err) {
        return undefined;
    }
}

export function check_cpp_version() {
    try {
        if (!cache.has("cpp")) {
            const raw = run("g++ --version").split("\n")[0];
            const result = semver().exec(raw)?.[0];
            if (result) {
                cache.set("cpp", (raw.includes("clang") ? "clang " : "g++ ") + result);
            }
        }

        return cache.get("cpp");
    } catch (err) {
        return undefined;
    }
}

export function check_python_version() {
    try {
        if (!cache.has("python")) {
            const raw = run("python --version");
            const result = semver().exec(raw)?.[0];
            if (result) {
                cache.set("python", "python " + result);
            }
        }

        return cache.get("python");
    } catch (err) {
        return undefined;
    }
}

export function check_go_version() {
    try {
        if (!cache.has("go")) {
            const raw = run("go version");
            const result = /go version go(\d+\.\d+\.\d+)/.exec(raw)?.[1];
            if (result) {
                cache.set("go", "go " + result);
            }
        }

        return cache.get("go");
    } catch (err) {
        return undefined;
    }
}

export function check_rust_version() {
    try {
        if (!cache.has("rust")) {
            const raw = run("cargo --version");
            const result = semver().exec(raw)?.[0];
            if (result) {
                cache.set("rust", "cargo " + result);
            }
        }

        return cache.get("rust");
    } catch (err) {
        return undefined;
    }
}

function run(command: string) {
    return execSync(command, { stdio: ["ignore", "pipe", "ignore"] })
        .toString()
        .trim();
}
