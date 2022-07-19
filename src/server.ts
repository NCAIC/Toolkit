import { WebSocketServer, WebSocket } from "ws";
import { Competition } from "./competition";
import { Config, Result, Team, Payload } from "./types";
import { complimentary, random_string } from "./utils";

export function server(config: Config, { port = 52022 } = {}) {
    let resolve = (payload: { teams: [Team, Team]; results: Result[] }) => {};
    let reject = () => {};
    const promise = new Promise<{ teams: [Team, Team]; results: Result[] }>(
        (...pair) => ([resolve, reject] = pair),
    );

    console.log("Starting server with config:", JSON.stringify(config, null, 4));

    const secret_token = random_string(8);

    let put_stone: undefined | ((x: number, y: number) => void);
    let started = false;

    const clients = new Set<WebSocket>();
    const wss = new WebSocketServer({ port }).on("connection", (ws) => {
        clients.add(ws);

        clients.forEach((ws) => {
            ws.send(
                JSON.stringify({
                    type: "client-count",
                    payload: { clients: clients.size, started },
                }),
            );
        });
        console.log("Client connected", clients.size);

        ws.on("close", () => {
            clients.delete(ws);

            clients.forEach((ws) => {
                ws.send(
                    JSON.stringify({
                        type: "client-count",
                        payload: { clients: clients.size },
                    }),
                );
            });

            console.log("Client disconnected", clients.size);
        });

        ws.on("message", (data) => {
            const msg = JSON.parse(data.toString());
            if (msg.type === "start" && msg.token === secret_token) {
                if (started) {
                    ws.send(
                        JSON.stringify({
                            type: "error",
                            payload: { message: "Competition already started." },
                        }),
                    );
                } else {
                    competition.start();
                    started = true;
                }
            } else if (msg.type === "put-stone" && msg.token === secret_token) {
                if (put_stone) {
                    put_stone(msg.payload.x, msg.payload.y);
                    put_stone = undefined;
                } else {
                    ws.send(
                        JSON.stringify({
                            type: "error",
                            payload: { message: "No stone to put." },
                        }),
                    );
                }
            } else if (msg.type === "ping") {
                ws.send(
                    JSON.stringify({
                        type: "pong",
                        payload: { time: Date.now() },
                    }),
                );
            }
        });
    });

    const teams: Team[] = Object.entries(config.teams).map(([name, { source, color }]) => ({
        name,
        cmd: source,
        color,
    }));

    if (!teams[0].color && typeof teams[1].color === "string") {
        teams[0].color = complimentary(teams[1].color);
    } else if (!teams[0].color) {
        teams[0].color = "#" + random_string(6, "0123456789abcdef");
    }

    while (teams.length < 2) {
        teams.push({ name: `Team ${teams.length}` });
    }

    if (!teams[1].color) {
        teams[1].color = complimentary(teams[0].color);
    }

    const competition = new Competition(teams as [Team, Team], config);
    competition.on("competition-start", (payload) => {
        console.log("Competition started with", payload.sets.length, "sets.");
        clients.forEach((ws) => {
            ws.send(
                JSON.stringify({
                    type: "competition-start",
                    payload: { ...payload, clients: clients.size, started: true },
                }),
            );
        });
    });
    competition.on("score-update", (payload) => {
        clients.forEach((ws) => {
            ws.send(
                JSON.stringify({
                    type: "score-update",
                    payload: { ...payload, clients: clients.size },
                }),
            );
        });
    });
    competition.on("competition-end", (payload) => {
        clients.forEach((ws) => {
            ws.send(JSON.stringify({ type: "competition-end" }));
        });

        wss.close();

        console.log("Results: ");
        for (let i = 0; i < payload.results.length; i++) {
            const result = payload.results[i] as Result;
            const win = result.win ? result.win.team.name : "Draw";
            console.log(`--- Set ${i + 1}: ${win} ---`);
            for (let j = 0; j < result.teams.length; j++) {
                console.log(`  ${result.teams[j].name}: ${result.time[j]} ms`);
            }
        }
        console.log("---");

        console.log("Competition ended.");
        resolve(payload);
    });
    competition.on("set-start", (payload: Payload) => {
        clients.forEach((ws) => {
            ws.send(
                JSON.stringify({
                    type: "set-start",
                    payload: { ...payload, clients: clients.size },
                }),
            );
        });
    });
    competition.on("set-update", (payload: Payload) => {
        clients.forEach((ws) => {
            ws.send(
                JSON.stringify({
                    type: "set-start",
                    payload: { ...payload, clients: clients.size },
                }),
            );
        });
    });
    competition.on("set-end", (payload: Payload) => {
        clients.forEach((ws) => {
            ws.send(
                JSON.stringify({
                    type: "set-start",
                    payload: { ...payload, clients: clients.size },
                }),
            );
        });
    });

    competition.on("wait", (payload: Payload & { put: typeof put_stone }) => {
        console.log("Waiting for player interaction...");
        put_stone = payload.put;
        clients.forEach((ws) => {
            ws.send(
                JSON.stringify({ type: "wait", payload: { ...payload, clients: clients.size } }),
            );
        });
    });

    console.log(
        [
            "---",
            `\x1b[93mJoin as an adminerstor: https://game.ncaic.cc/?url=ws://localhost:${port}/&token=${secret_token}\x1b[m`,
            "or",
            `\x1b[96mJoin as a spectator: https://game.ncaic.cc/?url=ws://localhost:${port}/\x1b[m`,
            "---",
        ].join("\n"),
    );

    return promise;
}
