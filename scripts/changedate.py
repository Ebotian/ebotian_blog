import re
from pathlib import Path
import shutil
import sys

TARGET_DIR = Path("/home/ebit/ebotian_blog/posts/禁止外传")
NEW_DATE = "0220-01-01"

if not TARGET_DIR.exists():
    print(f"目标目录不存在: {TARGET_DIR}")
    sys.exit(1)

md_files = list(TARGET_DIR.glob("*.md"))
if not md_files:
    print("未找到任何 .md 文件.")
    sys.exit(0)

processed = 0
for md in md_files:
    bak = md.with_name(md.name + ".bak")
    shutil.copy2(md, bak)

    text = md.read_text(encoding="utf-8")
    m = re.search(r"(?s)^---\s*(.*?)\s*---", text)  # 捕获 YAML front-matter 内容
    if not m:
        print(f"跳过 (无 front-matter): {md.name}")
        continue

    front = m.group(1)
    if re.search(r"(?m)^\s*date\s*:", front):
        new_front = re.sub(r"(?m)^\s*date\s*:.*$", f"date: {NEW_DATE}", front)
    else:
        # 如果没有 date 字段，则在 front-matter 开头插入
        new_front = f"date: {NEW_DATE}\n{front}"

    new_block = f"---\n{new_front.strip()}\n---"
    new_text = text[: m.start()] + new_block + text[m.end():]
    md.write_text(new_text, encoding="utf-8")
    processed += 1
    print(f"已更新: {md.name} (备份: {bak.name})")

print(f"完成，共更新 {processed} 个文件。")