use std::io;
use rand::Rng;

fn main() {
    let mut buffer = String::new();
    io::stdin().read_line(&mut buffer).unwrap();
    let mut splits = buffer.split(", ");

    let mut board = vec![0; 225];
    let mut stone = 0;
    let mut time = 0.0;

    for i in 0..225 {
        board[i] = splits.next().unwrap().parse::<i32>().unwrap();
    }
    stone = splits.next().unwrap().parse::<i32>().unwrap();
    time = splits.next().unwrap().parse::<f64>().unwrap();

    // eprintln!("{:?} {} {}", board, stone, time);

    let (x, y) = run(board, stone, time);
    println!("{} {}", x, y);
}


fn run(board: Vec<i32>, stone: i32, time: f64) -> (usize, usize) {
    let [mut x, mut y] = [0, 0];

    let mut rng = rand::thread_rng();

    while board[y * 15 + x] != 0 {
        x = rng.gen_range(0..15);
        y = rng.gen_range(0..15);
    }

    return (x, y);
}
