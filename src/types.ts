export enum SetResultType {
    none,
    row,
    invalid,
    timeout,
    draw,
}

export interface Config {
    title: string;
    teams: Record<string, { source?: string | null; color?: string }>;
    delay: {
        step: number;
        set: number;
    };
    competition: {
        rule: "double-sided" | "single-sided";
        matches: {
            type: "empty" | "random" | "fixed";
            stones?: [number, number][];
            count?: number;
            ext?: boolean;
        }[];
        timeout: {
            step: number;
            set: number;
        };
    };
}

export type CompetitionEvent = "competition-start" | "score-update" | "competition-end";
export type SetEvent = "set-start" | "set-update" | "set-end";

export interface Team {
    name: string;
    color?: string;
    cmd?: string;
}

export interface Result {
    board: COLOR[][];
    win: null | {
        team: Team;
        stones: [number, number][];
        reason: SetResultType;
    };
    teams: [Team, Team];
    time: [number, number];
    history: [number, number][];
}

export enum COLOR {
    EMPTY,
    BLACK,
    WHITE,
}

export interface Payload {
    title: string;
    board: COLOR[][];
    emphasized: {
        y: number;
        x: number;
        type: number;
    }[];
    teams: {
        name: string;
        color: string;
        time: {
            total: number;
            set: number;
            remaining: number;
        };
        stone: number;
    }[];
    now: number;
    sets: {
        type: SetResultType;
        color?: string;
    }[];
    clients: number;
}
