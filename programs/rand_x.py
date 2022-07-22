import random


def main():
    n = random.randint(0, 1000000007)
    m = 10000000
    for i in range(1, m + 1):
        n = (n * i) % 1000000007

    print(n)


if __name__ == '__main__':
    main()
