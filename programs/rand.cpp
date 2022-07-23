#include <iostream>
#include <string>
#include <sstream>
#include <ctime>
#define BOARDSIZE 15
#define EMPTY 0
#define BLACK 1
#define WHITE 2

using namespace std;

typedef struct
{
    int x, y;
} Position;
typedef struct
{
    int conti;
    bool empty;
} Peeked;

Position run(int board[], int stone, double time);
void parse(int board[], int* stone, double* time);

Position run(int board[], int stone, double time) {
    Position pos = { 0, 0 };
    while (board[pos.y * BOARDSIZE + pos.x] != EMPTY) {
        pos.x = rand() % BOARDSIZE;
        pos.y = rand() % BOARDSIZE;
    }
    return pos;
}

int main() {
    srand(time(NULL));

    int* board = new int[225];
    int stone = 0;
    double time = 0;

    parse(board, &stone, &time);

    Position selected = run(board, stone, time);
    cout << selected.y << " " << selected.x << endl;

    delete[] board;
    return EXIT_SUCCESS;
}

void parse(int board[], int* stone, double* time) {
    string S, T;
    getline(cin, S);

    stringstream X(S);
    for (size_t i = 0; i < 225; i++) {
        getline(X, T, ',');
        board[i] = stoi(T);
    }
    getline(X, T, ',');
    *stone = stoi(T);
    getline(X, T, ',');
    *time = stod(T);
}
