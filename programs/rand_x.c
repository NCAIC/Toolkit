#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <stdint.h>
#include <inttypes.h>
#include <time.h>

int main() {
    srand(time(NULL));

    int64_t n = rand() % 1000000007;
    int64_t m = 10000000;
    for (size_t i = 1; i <= m; i++) {
        n = (n * i) % 1000000007;
    }

    printf("%" PRId64 "\n", n);

    return EXIT_SUCCESS;
}
