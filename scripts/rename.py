import os
import re
from tqdm import tqdm

def rename_files(input_dir, old_prefix="第六本-", new_prefix="第七本-"):
    for root, _, files in os.walk(input_dir):
        for file in tqdm(files, desc="重命名处理中"):
            if file.startswith(old_prefix) and file.endswith("页.md"):
                new_name = file.replace(old_prefix, new_prefix, 1)
                old_path = os.path.join(root, file)
                new_path = os.path.join(root, new_name)
                os.rename(old_path, new_path)
                print(f"{file} -> {new_name}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("用法: python rename_md.py <目录> [旧前缀] [新前缀]")
    elif len(sys.argv) == 2:
        rename_files(sys.argv[1])
    elif len(sys.argv) == 4:
        rename_files(sys.argv[1], sys.argv[2], sys.argv[3])
    else:
        print("参数错误")