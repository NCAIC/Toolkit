package main

import (
	"fmt"
	"math/rand"
)

var (
	board [][]int32
	stone int32
	time  float64
)

func main() {
	parse()

	var x, y = run()

	fmt.Printf("%d, %d\n", x, y)
}

func run() (int32, int32) {
	var x, y = int32(0), int32(0)

	for board[x][y] != 0 {
		x, y = rand.Int31n(15), rand.Int31n(15)
	}

	return x, y
}

func parse() {
	for i := 0; i < 15; i++ {
		board = append(board, []int32{})
		for j := 0; j < 15; j++ {
			board[i] = append(board[i], 0)
			fmt.Scanf("%d,", &board[i][j])
		}
	}

	fmt.Scanf("%d, %f", &stone, &time)

	// fmt.Fprintln(os.Stderr, board, stone, time)
}
