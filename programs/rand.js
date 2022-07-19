const [BOARDSIZE, EMPTY, BLACK, WHITE] = [15, 0, 1, 2];

/**
 * 選擇下棋位置
 * (空: 0, 黑: 1, 白: 2)
 * @param board 15x15 的棋盤
 * @param stone 我方棋子顏色
 * @param timer 該局我方剩餘時間
 * @returns [x, y] 該局下棋位置
 */
function main(board, stone, timer) {
    let [x, y] = [0, 0];

    while (board[y][x] !== EMPTY) {
        x = Math.floor(Math.random() * BOARDSIZE);
        y = Math.floor(Math.random() * BOARDSIZE);
    }

    return [x, y];
}

process.stdin.on("data", (data) => {
    const raw = data.toString();
    const parts = raw.split(/, /g);

    const board = Array.from({ length: BOARDSIZE }, () =>
        Array.from({ length: BOARDSIZE }, () => 0),
    );
    for (let i = 0; i < BOARDSIZE; i++) {
        for (let j = 0; j < BOARDSIZE; j++) {
            board[i][j] = parseInt(parts[i * BOARDSIZE + j]);
        }
    }
    const stone = parseInt(parts[225]);
    const timer = parseFloat(parts[226]);

    const [x, y] = main(board, stone, timer);

    console.log(x, y);
});

/**
 * 從 board[i][j] 往八個方向看，看此方向有連續幾顆 stone 顏色的棋，以及在這些棋子之後是否有空位
 * @param board 15x15 的棋盤
 * @param i 觀看位置的列
 * @param j 觀看位置的行
 * @param stone 觀看方棋子顏色
 * @returns [conti, empty][] 該方連續棋數及該方在這些棋之後是否有空位
 * @example
 *  board =
 *    [[0, 0, 0, 0, 2],
 *     [0, 0, 1, 1, 2],
 *     [0, 1, 1, 1, 1],
 *     [0, 1, 1, 1, 2],
 *     [0, 1, 1, 1, 2]]
 *  peek(board, 2, 2, 1) -> [[1, true], [1, false], [2, false], [1, false], [2, false], [1, true], [1, true], [0, true]]
 */
function peek(board, i, j, stone) {
    if (i < 0 || i >= BOARDSIZE || j < 0 || j >= BOARDSIZE) {
        throw new Error("Invalid index to peek!");
    }

    const ret = Array.from({ length: 8 }, () => [0, false]);

    let [delX, delY] = [0, 0];
    for (let k = 0; k < 8; k++) {
        let [y, x] = [i, j];

        if (k === 2 || k === 6) delY = 0;
        else delY = k > 2 && k < 6 ? 1 : -1;

        if (k === 0 || k === 4) delX = 0;
        else delX = k > 0 && k < 4 ? 1 : -1;

        while (true) {
            y += delY;
            x += delX;
            if (y < 0 || y >= BOARDSIZE) break;
            if (x < 0 || x >= BOARDSIZE) break;
            if (board[y][x] !== stone) break;
            ret[k][0] += 1;
        }
        if (y < 0 || y >= BOARDSIZE) continue;
        if (x < 0 || x >= BOARDSIZE) continue;
        ret[k][1] = board[y][x] === EMPTY;
    }

    return ret;
}
