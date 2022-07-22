use rand::Rng;

fn main() {
    let mut rng = rand::thread_rng();
    let mut n: i64 = rng.gen_range(0..1000000007);
    let m = 10000000;
    for i in 1..=m {
        n = (n * i) % 1000000007;
    }
    
    println!("{}", n);
}
