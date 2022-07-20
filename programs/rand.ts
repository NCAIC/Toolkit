const [BOARDSIZE, EMPTY, BLACK, WHITE] = [15, 0, 1, 2] as const;

function run(board: number[][], stone: number, timer: number) {
    let [x, y] = [0, 0];

    while (board[y][x] !== EMPTY) {
        x = Math.floor(Math.random() * BOARDSIZE);
        y = Math.floor(Math.random() * BOARDSIZE);
    }

    return [x, y];
}

process.stdin.on("data", (data) => {
    const slices = data.toString().split(/, /g);

    const board: number[][] = [];
    for (let i = 0; i < BOARDSIZE; i++) {
        board.push([]);
        for (let j = 0; j < BOARDSIZE; j++) {
            board[i].push(parseInt(slices[i * BOARDSIZE + j]));
        }
    }
    const stone = parseInt(slices[225]);
    const timer = parseFloat(slices[226]);

    const [x, y] = run(board, stone, timer);

    console.log(y, x);
});
