import os
from tqdm import tqdm
from tenacity import retry, stop_after_attempt, wait_fixed
from openai import OpenAI

# DeepSeek API配置
client = OpenAI(
    api_key="sk-",
    base_url="https://api.deepseek.com"
)

SYSTEM_PROMPT = (
    "你是专业的中文文本纠错助手，严格遵循提示词工程最佳实践："
    "1. 只输出纠正后的文本，不输出任何解释、分析、修改意见等内容。"
    "2. 只对OCR文本中的错别字、语法、标点、语句通顺性等常见问题进行纠正，保持原文风格和结构，不做无关扩写或删减。"
    "3. 结合上下文理解，确保语句自然流畅。"
    "4. 不要添加或省略原文信息。"
    "5. 输出内容与输入格式一致。"
)

@retry(stop=stop_after_attempt(5), wait=wait_fixed(2))
def correct_text(text):
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": text},
        ],
        max_tokens=8192,
        temperature=0,
        stream=False
    )
    return response.choices[0].message.content

def get_md_files(input_dir):
    for root, _, files in os.walk(input_dir):
        for file in files:
            if file.lower().endswith('.md'):
                yield os.path.join(root, file)

import re

def split_frontmatter(content):
    """分离 frontmatter 和正文"""
    match = re.match(r"(?s)(---.*?---\s*)(.*)", content)
    if match:
        return match.group(1), match.group(2)
    else:
        return "", content

def main(input_dir, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    md_files = list(get_md_files(input_dir))
    for md_path in tqdm(md_files, desc="AI纠错处理中"):
        with open(md_path, "r", encoding="utf-8") as f:
            content = f.read()
        front, body = split_frontmatter(content)
        try:
            corrected = correct_text(body)
        except Exception as e:
            print(f"纠错失败: {md_path} -> {e}")
            corrected = f"**纠错失败:** {str(e)}"
        out_path = os.path.join(output_dir, os.path.basename(md_path))
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(front + corrected)
    print("全部纠错完成，结果已保存到", output_dir)

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("用法: python ocr_correct.py <原md目录> <纠错后输出目录>")
    else:
        main(sys.argv[1], sys.argv[2])