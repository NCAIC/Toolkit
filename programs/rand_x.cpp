#include <iostream>
#include <cstdlib>
#include <cstdint>
#include <cinttypes>
#include <ctime>

int main() {
    std::srand(std::time(NULL));

    int64_t n = std::rand() % 1000000007;
    int64_t m = 10000000;
    for (size_t i = 1; i <= m; i++) {
        n = (n * i) % 1000000007;
    }

    std::cout << n << '\n';

    return EXIT_SUCCESS;
}
