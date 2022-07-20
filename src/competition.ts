import { spawnSync } from "node:child_process";
import EventEmitter from "node:events";
import path from "node:path";
import { runner } from "./runner";
import { COLOR, Config, Result, Team, Payload, SetResultType } from "./types";
import { copy, sleep } from "./utils";

const BOARD_SIZE = 15;

export class Board {
    public board: COLOR[][] = [];
    constructor(match: Config["competition"]["matches"][number]) {
        this.board = Array.from({ length: BOARD_SIZE }, () =>
            Array.from({ length: BOARD_SIZE }, () => COLOR.EMPTY),
        );

        if (match.type === "random") {
            const positions = Array.from({ length: 81 }, (_, i) => [
                3 + Math.floor(i / 9),
                3 + (i % 9),
            ]).sort(() => Math.random() - 0.5);

            for (let i = 0; i < (match.count ?? 4) && i < 225; i++) {
                this.board[positions[i][0]][positions[i][1]] =
                    i % 2 === 0 ? COLOR.BLACK : COLOR.WHITE;
            }
        } else if (match.type === "fixed") {
            const stones = match.stones ?? [];
            for (let i = 0; i < stones.length; i++) {
                this.board[stones[i][0]][stones[i][1]] = i % 2 === 0 ? COLOR.BLACK : COLOR.WHITE;
            }
        }
    }
}

export class GameSet extends EventEmitter {
    public result: Result;
    public teams: [Team, Team];
    public time: [number, number] = [0, 0];
    public board: COLOR[][];
    public config: { delay: Config["delay"]; timeout: Config["competition"]["timeout"] };
    public turn = 0;
    public ext = false;
    public put?: (x: number, y: number) => void;

    constructor(
        teams: [Team, Team],
        board: COLOR[][],
        config: { delay: { step: number; set: number }; timeout: { step: number; set: number } },
    ) {
        super();

        this.teams = teams;
        this.board = board;
        this.config = config;

        this.result = { win: null, teams, board, history: [], time: this.time };
    }

    public async start() {
        this.emit("set-start", { stats: this.result });
        await sleep(
            this.config.delay.step * this.board.flat().filter((c) => c !== COLOR.EMPTY).length,
        );
        await this.next();
    }

    private async next() {
        const idx = this.turn % 2;
        const team = this.teams[idx];
        const input = `${this.board.flat().join(", ")}, ${idx + 1}, ${
            (this.config.timeout.set - this.time[idx]) / 1000
        }`;

        let x: number | undefined, y: number | undefined;
        let time = 0;
        if (team.exe) {
            const start_time = Date.now();
            const sub = spawnSync(runner(team.exe), {
                shell: true,
                encoding: "utf8",
                input,
                timeout: Math.max(
                    Math.min(this.config.timeout.step, this.config.timeout.set - this.time[idx]),
                    0,
                ),
                stdio: ["pipe", "pipe", process.env.VERBOSE ? "inherit" : "ignore"],
                cwd: path.dirname(team.exe),
            });
            // console.log(sub.stdout);
            const end_time = Date.now();

            const time = end_time - start_time;
            this.time[idx] += time;

            [y, x] = sub.output[1]?.split(" ").map((s) => parseInt(s, 10)) ?? [-1, -1];
        } else {
            const promise = new Promise<[number, number]>((resolve) => {
                this.put = (x, y) => resolve([x, y]);
            });

            const start_time = Date.now();
            this.emit(
                "wait",
                copy({
                    board: this.board,
                    stone: idx + 1,
                    time: (this.config.timeout.set - this.time[idx]) / 1000,
                }),
            );
            [x, y] = await Promise.race([
                promise,
                sleep(
                    Math.min(this.config.timeout.step, this.config.timeout.set - this.time[idx]),
                    [undefined, undefined],
                ),
            ]);
            const end_time = Date.now();

            this.put = undefined;

            time = end_time - start_time;
            this.time[idx] += time;
        }

        if (this.time[idx] >= this.config.timeout.set) {
            this.result.win = {
                team: this.teams[(idx + 1) % 2],
                reason: SetResultType.timeout,
                stones: [],
            };
            console.log(`Timed out: ${team.name}`);
            this.emit("set-end", { stats: this.result });
            return;
        }

        if (process.env.VERBOSE) {
            console.log(`${team.name} played ${x}, ${y}`);
        }

        if (
            x === undefined ||
            y === undefined ||
            x < 0 ||
            x >= BOARD_SIZE ||
            y < 0 ||
            y >= BOARD_SIZE ||
            this.board[y][x] !== COLOR.EMPTY
        ) {
            this.result.win = {
                team: this.teams[(idx + 1) % 2],
                reason: SetResultType.invalid,
                stones: [],
            };
            console.log(`Invalid move: ${team.name} played ${x}, ${y}`);
            this.emit("set-end", { stats: this.result });
            return;
        }

        this.board[y][x] = idx ? COLOR.WHITE : COLOR.BLACK;
        this.result.history.push([x, y]);

        this.emit("set-update", { stats: this.result });

        const checked = this.check();
        if (checked.winner) {
            console.log(checked);
            this.result.win = {
                team: this.teams[checked.winner - 1],
                reason: SetResultType.row,
                stones: checked.stones,
            };
            this.emit("set-end", { stats: this.result });
        } else if (this.board.flat(2).every((c) => c !== COLOR.EMPTY)) {
            this.result.win = {
                reason: SetResultType.draw,
                team: this.teams[-1],
                stones: [],
            };
            this.emit("set-end", { stats: this.result });
        } else {
            this.turn++;
            await new Promise((resolve) => setTimeout(resolve, this.config.delay.step - time));
            await this.next();
        }
    }

    private check(): {
        winner: COLOR;
        stones: [number, number][];
    } {
        // check -
        for (let i = 0; i < BOARD_SIZE; i++) {
            let current = COLOR.EMPTY;
            let stones: [number, number][] = [];
            for (let j = 0; j < BOARD_SIZE; j++) {
                if (this.board[i][j] === COLOR.EMPTY) {
                    stones = [];
                } else if (this.board[i][j] !== current) {
                    stones = [[i, j]];
                    current = this.board[i][j];
                } else {
                    stones.push([i, j]);
                }

                if (stones.length >= 5) {
                    return { winner: current, stones };
                }
            }
        }

        // check |
        for (let i = 0; i < BOARD_SIZE; i++) {
            let current = COLOR.EMPTY;
            let stones: [number, number][] = [];
            for (let j = 0; j < BOARD_SIZE; j++) {
                if (this.board[j][i] === COLOR.EMPTY) {
                    stones = [];
                } else if (this.board[j][i] !== current) {
                    stones = [[j, i]];
                    current = this.board[j][i];
                } else {
                    stones.push([j, i]);
                }

                if (stones.length >= 5) {
                    return { winner: current, stones };
                }
            }
        }

        // check \
        for (let _i = BOARD_SIZE - 5; _i >= 0; _i--) {
            let current = COLOR.EMPTY;
            let stones: [number, number][] = [];
            let i = _i;
            for (let j = 0; i < BOARD_SIZE && j < BOARD_SIZE; i++, j++) {
                if (this.board[i][j] === COLOR.EMPTY) {
                    stones = [];
                } else if (this.board[i][j] !== current) {
                    stones = [[i, j]];
                    current = this.board[i][j];
                } else {
                    stones.push([i, j]);
                }

                if (stones.length >= 5) {
                    return { winner: current, stones };
                }
            }
        }
        for (let _j = 1; _j < BOARD_SIZE - 4; _j++) {
            let current = COLOR.EMPTY;
            let stones: [number, number][] = [];
            let j = _j;
            for (let i = 0; i < BOARD_SIZE && j < BOARD_SIZE; i++, j++) {
                if (this.board[i][j] === COLOR.EMPTY) {
                    stones = [];
                } else if (this.board[i][j] !== current) {
                    stones = [[i, j]];
                    current = this.board[i][j];
                } else {
                    stones.push([i, j]);
                }

                if (stones.length >= 5) {
                    return { winner: current, stones };
                }
            }
        }

        // check /
        for (let _i = 4; _i < BOARD_SIZE; _i++) {
            let current = COLOR.EMPTY;
            let stones: [number, number][] = [];
            let i = _i;
            for (let j = 0; i >= 0 && j < BOARD_SIZE; i--, j++) {
                if (this.board[i][j] === COLOR.EMPTY) {
                    stones = [];
                } else if (this.board[i][j] !== current) {
                    stones = [[i, j]];
                    current = this.board[i][j];
                } else {
                    stones.push([i, j]);
                }

                if (stones.length >= 5) {
                    return { winner: current, stones };
                }
            }
        }
        for (let _j = 1; _j < BOARD_SIZE - 4; _j++) {
            let current = COLOR.EMPTY;
            let stones: [number, number][] = [];
            let j = _j;
            for (let i = BOARD_SIZE - 1; i >= 0 && j < BOARD_SIZE; i--, j++) {
                if (this.board[i][j] === COLOR.EMPTY) {
                    stones = [];
                } else if (this.board[i][j] !== current) {
                    stones = [[i, j]];
                    current = this.board[i][j];
                } else {
                    stones.push([i, j]);
                }

                if (stones.length >= 5) {
                    return { winner: current, stones };
                }
            }
        }

        return { winner: COLOR.EMPTY, stones: [] };
    }

    public export() {
        return copy(this.result);
    }
}

export class Competition extends EventEmitter {
    public teams: [Team, Team];
    public config: Config;
    public results: Result[] = [];
    public sets: GameSet[] = [];

    constructor(teams: [Team, Team], config: Config) {
        super();

        this.teams = teams;
        this.config = config;

        for (const match of this.config.competition.matches) {
            const board = new Board(match).board;

            this.sets.push(
                new GameSet(copy(teams), copy(board), {
                    delay: this.config.delay,
                    timeout: this.config.competition.timeout,
                }),
            );
            if (match.ext) {
                this.sets[this.sets.length - 1].ext = true;
            }

            if (this.config.competition.rule === "double-sided") {
                this.sets.push(
                    new GameSet(copy([teams[1], teams[0]]), copy(board), {
                        delay: this.config.delay,
                        timeout: this.config.competition.timeout,
                    }),
                );
                if (match.ext) {
                    this.sets[this.sets.length - 1].ext = true;
                }
            }
        }
    }

    public async start() {
        const payload: Payload = {
            title: this.config.title,
            teams: this.teams.map((team, idx) => ({
                ...(team as Required<Team>),
                time: {
                    total: 0,
                    set: this.config.competition.timeout.set,
                    remaining: this.config.competition.timeout.set,
                },
                stone: +!idx,
            })),
            board: this.sets[0].board,
            emphasized: [],
            sets: this.sets.map(() => ({ type: SetResultType.none })),
            now: 0,
            clients: 0,
        };

        this.emit("competition-start", copy(payload));

        for (let i = 0; i < this.sets.length; i++) {
            const set = this.sets[i];

            if (set.ext === true) {
                const score = this.get_score();

                const round_over =
                    this.config.competition.rule === "single-sided" ||
                    (this.config.competition.rule === "double-sided" &&
                        this.results.length % 2 === 0);

                const wins = Object.values(score).map((v) => v.win);
                if (wins[0] !== wins[1] && round_over) {
                    break;
                }
            }

            set.on("set-start", ({ stats }: { stats: Result }) => {
                payload.board = stats.board;
                payload.emphasized = [];
                for (const team of payload.teams) {
                    team.time.total =
                        this.results
                            .map((r) => {
                                return r.time[r.teams.findIndex((t) => t.name === team.name)] ?? 0;
                            })
                            .reduce((a, b) => a + b, 0) +
                            stats.time[stats.teams.findIndex((t) => t.name === team.name)] ?? 0;

                    team.time.remaining =
                        team.time.set -
                        stats.time[stats.teams.findIndex((t) => t.name === team.name)];

                    team.stone = +!team.stone;
                }
                payload.now = stats.board.flat().filter((v) => v !== COLOR.EMPTY).length % 2;
                this.emit("set-start", copy(payload));
            });
            set.on("set-update", ({ stats }: { stats: Result }) => {
                payload.emphasized = board_diff(payload.board, stats.board).map(([y, x]) => ({
                    x,
                    y,
                    type: 1,
                }));
                payload.board = copy(stats.board);
                for (const team of payload.teams) {
                    team.time.total =
                        this.results
                            .map((r) => {
                                return r.time[r.teams.findIndex((t) => t.name === team.name)] ?? 0;
                            })
                            .reduce((a, b) => a + b, 0) +
                            stats.time[stats.teams.findIndex((t) => t.name === team.name)] ?? 0;

                    team.time.remaining =
                        team.time.set -
                        stats.time[stats.teams.findIndex((t) => t.name === team.name)];
                }
                payload.now = stats.board.flat().filter((v) => v !== COLOR.EMPTY).length % 2;
                this.emit("set-update", copy(payload));
            });
            set.on("set-end", ({ stats }: { stats: Result }) => {
                payload.emphasized = stats.win?.stones.map(([y, x]) => ({ x, y, type: 2 })) ?? [];
                payload.board = stats.board;
                for (const team of payload.teams) {
                    team.time.total =
                        this.results
                            .map((r) => {
                                return r.time[r.teams.findIndex((t) => t.name === team.name)] ?? 0;
                            })
                            .reduce((a, b) => a + b, 0) +
                            stats.time[stats.teams.findIndex((t) => t.name === team.name)] ?? 0;

                    team.time.remaining =
                        team.time.set -
                        stats.time[stats.teams.findIndex((t) => t.name === team.name)];
                }
                payload.now = -1;
                this.emit("set-end", copy(payload));
            });

            set.on("wait", ({ board, stone, time }) => {
                this.emit("wait", { ...copy(payload), put: set.put });
            });

            await set.start();

            this.results.push(set.export());

            payload.sets[i] = {
                type: set.result.win?.reason ?? SetResultType.draw,
                color: this.teams.find((t) => set.result.win?.team.name === t.name)?.color,
            };

            this.emit("score-update", copy(payload));

            await new Promise((resolve) => setTimeout(resolve, this.config.delay.set));
        }

        this.emit("competition-end", copy({ teams: this.teams, results: this.results }));
    }

    private get_score() {
        const score: Record<
            string,
            {
                win: number;
                time: number;
            }
        > = {};

        for (const team of this.teams) {
            score[team.name] = {
                win: this.results.reduce(
                    (acc, result) =>
                        result.win && result.win.team.name === team.name ? acc + 1 : acc,
                    0,
                ),
                time: this.results.reduce(
                    (acc, result) =>
                        acc + result.time[result.teams.findIndex((t) => t.name === team.name)],
                    0,
                ),
            };
        }

        return score;
    }
}

function board_diff(a: COLOR[][], b: COLOR[][]): [number, number][] {
    const diff: [number, number][] = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (a[i][j] !== b[i][j]) {
                diff.push([i, j]);
            }
        }
    }
    return diff;
}
