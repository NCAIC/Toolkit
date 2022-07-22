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

Peeked *peek(int board[], int i, int j, int stone);
Position run(int board[], int *stone, double *time);
void parse(int board[], int *stone, double *time);

Position run(int board[], int *stone, double *time)
{
    Position pos = {0, 0};
    while (board[pos.y * BOARDSIZE + pos.x] != EMPTY)
    {
        pos.x = rand() % BOARDSIZE;
        pos.y = rand() % BOARDSIZE;
    }
    return pos;
}

int main()
{
    srand(time(NULL));

    int *board = new int[225];
    int stone = 0;
    double time = 0;

    parse(board, &stone, &time);

    Position selected = run(board, &stone, &time);
    cout << selected.y << " " << selected.x << endl;

    delete[] board;
    return EXIT_SUCCESS;
}

Peeked *peek(int board[], int i, int j, int stone)
{
    if (i < 0 || i >= BOARDSIZE || j < 0 || j >= BOARDSIZE)
    {
        exit(EXIT_FAILURE);
    }

    Peeked *ret = new Peeked[8];

    int delX = 0, delY = 0;

    for (size_t k = 0; k < 8; k++)
    {
        int y = i, x = j;

        if (k == 2 || k == 6)
            delY = 0;
        else
            delY = k > 2 && k < 6 ? 1 : -1;

        if (k == 0 || k == 4)
            delX = 0;
        else
            delX = k > 0 && k < 4 ? 1 : -1;

        while (true)
        {
            y += delY;
            x += delX;
            if (y < 0 || y >= BOARDSIZE)
                break;
            if (x < 0 || x >= BOARDSIZE)
                break;
            if (board[y * BOARDSIZE + x] != stone)
                break;
            (ret + k)->conti++;
        }
        if (y < 0 || y >= BOARDSIZE)
            continue;
        if (x < 0 || x >= BOARDSIZE)
            continue;
        (ret + k)->empty = board[y * BOARDSIZE + x] == EMPTY;
    }

    return ret;
}

void parse(int board[], int *stone, double *time)
{
    string S, T;
    getline(cin, S);
    stringstream X(S);
    for (size_t i = 0; i < 227; i++)
    {
        getline(X, T, ',');
        board[i] = stoi(T);
    }
}