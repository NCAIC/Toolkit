#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <stdint.h>
#include <inttypes.h>
#include <time.h>
#define BOARDSIZE 15
#define EMPTY 0
#define BLACK 1
#define WHITE 2

typedef struct { int8_t x, y; } Position;
typedef struct { int8_t conti; bool empty; } Peeked;

Peeked* peek(int8_t board[], int8_t i, int8_t j, int8_t stone);
Position run(int8_t board[], int8_t stone, double time);
void parse(int8_t board[], int8_t* stone, double* time);

Position run(int8_t board[], int8_t stone, double time) {
    Position pos = { 0, 0 };

    while (board[pos.y * BOARDSIZE + pos.x] != EMPTY) {
        pos.x = rand() % BOARDSIZE;
        pos.y = rand() % BOARDSIZE;
    }

    return pos;
}

int main() {
    srand(time(NULL));

    int8_t* board = calloc(225, sizeof(int8_t));
    int8_t stone = 0;
    double time = 0;

    parse(board, &stone, &time);

    Position selected = run(board, stone, time);

    printf("%" PRId8 " %" PRId8 "\n", selected.y, selected.x);

    return EXIT_SUCCESS;
}

Peeked* peek(int8_t board[], int8_t i, int8_t j, int8_t stone) {
    if (i < 0 || i >= BOARDSIZE || j < 0 || j >= BOARDSIZE) {
        exit(EXIT_FAILURE);
    }

    Peeked* ret = calloc(8, sizeof(Peeked));

    int8_t delX = 0, delY = 0;

    for (size_t k = 0; k < 8; k++) {
        int8_t y = i, x = j;

        if (k == 2 || k == 6) delY = 0;
        else delY = k > 2 && k < 6 ? 1 : -1;

        if (k == 0 || k == 4) delX = 0;
        else delX = k > 0 && k < 4 ? 1 : -1;

        while (true) {
            y += delY;
            x += delX;
            if (y < 0 || y >= BOARDSIZE) break;
            if (x < 0 || x >= BOARDSIZE) break;
            if (board[y * BOARDSIZE + x] != stone) break;
            (ret + k)->conti++;
        }
        if (y < 0 || y >= BOARDSIZE) continue;
        if (x < 0 || x >= BOARDSIZE) continue;
        (ret + k)->empty = board[y * BOARDSIZE + x] == EMPTY;
    }

    return ret;
}

void parse(int8_t board[], int8_t* stone, double* time) {
    for (size_t i = 0; i < 225; i++) {
        scanf("%" SCNd8 ", ", board + i);
    }
    scanf("%" SCNd8 ", %lf", stone, time);

    // for (size_t i = 0; i < 225; i++) {
    //     fprintf(stderr, "%" PRId8 ", ", board[i]);
    // }
    // fprintf(stderr, "%" PRId8 ", %lf\n", *stone, *time);

    return;
}
