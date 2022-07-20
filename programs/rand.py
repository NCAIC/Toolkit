import random

[BOARDSIZE, EMPTY, BLACK, WHITE] = [15, 0, 1, 2]


def user(board, stone, time):
    i, j = random.randint(0, 14), random.randint(0, 14)
    while board[i][j] != EMPTY:
        i, j = random.randint(0, 14), random.randint(0, 14)
    return i, j


def main():
    splits = input().split(", ")
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
