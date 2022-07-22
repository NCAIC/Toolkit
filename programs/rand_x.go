package main

import (
	"fmt"
	"math/rand"
	"time"
)

func main() {
	rand.Seed(time.Now().UnixNano())

	n := rand.Int63n(1000000007)
	m := int64(10000000)
	for i := int64(1); i <= m; i++ {
		n = (n * i) % 1000000007
	}

	fmt.Println(n)
}
