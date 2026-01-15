import random
import string
import argparse
from pathlib import Path


def rand_filename(min_len=8, max_len=16) -> str:
    n = random.randint(min_len, max_len)
    return "".join(random.choices(string.ascii_letters + string.digits, k=n))


def rand_text_block(min_words=40, max_words=120) -> str:
    vocab = [
        "alpha", "beta", "gamma", "delta", "theta", "lambda", "sigma", "omega",
        "cache", "dedup", "hash", "chunk", "block", "index", "metadata", "fingerprint",
        "storage", "filesystem", "compress", "entropy", "random", "pattern", "similar",
        "payload", "content", "stream", "packet", "buffer", "segment", "token",
        "search", "compare", "match", "unique", "duplicate", "ratio", "test", "dataset",
        "pipeline", "worker", "thread", "async", "sync", "commit", "rollback",
    ]
    words = []
    count = random.randint(min_words, max_words)
    for _ in range(count):
        w = random.choice(vocab)
        if random.random() < 0.08:
            w += str(random.randint(0, 999))
        words.append(w)
    return " ".join(words)


def ensure_min_bytes(text: str, min_bytes: int) -> str:
    while len(text.encode("utf-8")) < min_bytes:
        text += "\n" + rand_text_block()
    return text


def gen_one_file_content(min_bytes: int) -> str:
    blocks = []
    for _ in range(random.randint(6, 12)):
        blocks.append(rand_text_block())
    content = "\n".join(blocks) + "\n"
    return ensure_min_bytes(content, min_bytes)


def build_dataset(out_dir: str,
                  file_count: int,
                  min_size_bytes: int,
                  dup_ratio_min: float,
                  dup_ratio_max: float,
                  seed: int | None):
    """
    “重复率”定义为：整个数据集中有 dup_ratio 的文件，是其它文件的完全复制副本。
    即：重复文件 = 完全相同内容（字节级一致）。
    """
    if seed is not None:
        random.seed(seed)

    out_path = Path(out_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    dup_ratio = random.uniform(dup_ratio_min, dup_ratio_max)

    dup_files = int(round(file_count * dup_ratio))
    unique_files = file_count - dup_files

    unique_contents = [gen_one_file_content(min_size_bytes) for _ in range(unique_files)]
    duplicate_contents = [random.choice(unique_contents) for _ in range(dup_files)]

    all_contents = unique_contents + duplicate_contents
    random.shuffle(all_contents)

    used_names = set()
    for i, content in enumerate(all_contents):
        while True:
            name = rand_filename()
            if name not in used_names:
                used_names.add(name)
                break

        file_path = out_path / f"{name}.txt"
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)

    print(f"[OK] Generated {file_count} txt files in: {out_path.resolve()}")
    print(f"[INFO] Each file >= {min_size_bytes} bytes")
    print(f"[INFO] Duplicate-file ratio = {dup_ratio:.3f} "
          f"(dup_files={dup_files}, unique_files={unique_files})")
    print("[INFO] Duplicates are EXACT copies (byte-identical).")


def main():
    parser = argparse.ArgumentParser(description="Generate txt dataset for exact file dedup testing.")
    parser.add_argument("--out", type=str, default="txt_dataset", help="Output directory")
    parser.add_argument("--count", type=int, default=200, help="Number of txt files")
    parser.add_argument("--min-bytes", type=int, default=500, help="Minimum size per file in bytes")
    parser.add_argument("--dup-min", type=float, default=0.30, help="Min duplicate file ratio")
    parser.add_argument("--dup-max", type=float, default=0.50, help="Max duplicate file ratio")
    parser.add_argument("--seed", type=int, default=None, help="Random seed (optional)")
    args = parser.parse_args()

    build_dataset(
        out_dir=args.out,
        file_count=args.count,
        min_size_bytes=args.min_bytes,
        dup_ratio_min=args.dup_min,
        dup_ratio_max=args.dup_max,
        seed=args.seed
    )


if __name__ == "__main__":
    main()