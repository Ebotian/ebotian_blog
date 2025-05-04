import os
import re
from datetime import datetime, timedelta
import math

def get_page_num(filename):
    match = re.search(r'第六本-(\d+)页\.md', filename)
    return int(match.group(1)) if match else None

def update_date_in_file(filepath, new_date):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    # 替换 frontmatter 日期或插入新的 date 字段
    if re.search(r'date:\s*\d{4}-\d{2}-\d{2}', content):
        new_content = re.sub(r'date:\s*\d{4}-\d{2}-\d{2}', f'date: {new_date}', content)
    else:
        # 替换P25-03-10或类似格式为date: YYYY-MM-DD
        new_content = re.sub(r'---\s*\n.*?\n---', f'---\ndate: {new_date}\n---', content, count=1, flags=re.DOTALL)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)

def main(md_dir, base_file):
    # 获取基准文件的日期
    base_path = os.path.join(md_dir, base_file)
    with open(base_path, "r", encoding="utf-8") as f:
        content = f.read()
    match = re.search(r'date:\s*(\d{4}-\d{2}-\d{2})', content)
    if not match:
        # 如果没有date字段，尝试从P25-03-10格式解析
        match2 = re.search(r'P(\d{2})-(\d{2})-(\d{2})', content)
        if not match2:
            print("未找到基准文件日期")
            return
        year = 2000 + int(match2.group(1))
        month = int(match2.group(2))
        day = int(match2.group(3))
        base_date = datetime(year, month, day)
    else:
        base_date = datetime.strptime(match.group(1), "%Y-%m-%d")

    # 收集所有第七本-XX页.md文件
    files = []
    for file in os.listdir(md_dir):
        if file.startswith("第六本-") and file.endswith("页.md"):
            num = get_page_num(file)
            if num is not None:
                files.append((num, file))
    # 按页码倒序排列
    files.sort(reverse=True)

    for idx, (num, file) in enumerate(files):
        days_to_subtract = math.ceil(1.5 * (files[0][0] - num))
        new_date = (base_date - timedelta(days=days_to_subtract)).strftime("%Y-%m-%d")
        update_date_in_file(os.path.join(md_dir, file), new_date)
        print(f"{file} -> {new_date}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 3:
        print("用法: python fix_date.py <md目录> <基准文件名>")
    else:
        main(sys.argv[1], sys.argv[2])