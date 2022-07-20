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

void parse(int8_t board[], int8_t* stone, double* time) {
    for (size_t i = 0; i < 225; i++) {
        scanf("%" SCNd8 ", ", board + i);
    }
    scanf("%" SCNd8 ", %lf", stone, time);
}
