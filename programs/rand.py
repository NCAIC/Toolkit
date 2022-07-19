from simplelib import *
import random

[BOARDSIZE, EMPTY, BLACK, WHITE] = [15, 0, 1, 2]

'''
user:
    輸入目前的棋盤跟你是黑棋或白棋(1 or 2)，以及剩餘的時間
    回傳你要下的 index: (row, col)
    param:
        board: list[list[int]]
            board.size == board[0].size == BOARDSIZE
        myStone: int
            myStone in [EMPTY, BLACK, WHITE] (0, 1, 2)
        remain_time: float
            remaining time(unit: second)
    return: row, column
定義請看 variables.py
輔助函式請看 simplelib.py
整個 user 都可以改，除此之外都不要改                                                                
NOTE: 若要debug，請使用 print("message", file=sys.stderr)，不要 print 到stdout
'''


def user(board, stone, time):
    i, j = random.randint(0, 14), random.randint(0, 14)
    while board[i][j] != EMPTY:
        i, j = random.randint(0, 14), random.randint(0, 14)
    return i, j


def main():
    raw = input()
    splits = raw.split(", ")
    board = [[]] * 15
    for row in range(15):
        board[row] = [0] * 15
    for i in range(15):
        for j in range(15):
            board[i][j] = int(splits[i*15+j])

    stone = int(splits[225])
    time = float(splits[226])
    i, j = user(board, stone, time)
    print(i, j)


if __name__ == '__main__':
    main()
