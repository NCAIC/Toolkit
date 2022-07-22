function main() {
    let n = Math.floor(Math.random() * 1000000007);
    const m = 10000000;
    for (let i = 1; i <= m; i++) {
        n = (n * i) % 1000000007;
    }

    console.log(n);
}

main();
