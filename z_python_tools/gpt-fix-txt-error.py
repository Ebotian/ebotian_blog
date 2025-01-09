import os
import http.client
import json
import time
from tqdm import tqdm

# 设置 API 密钥和 URL
API_KEY = ""
API_HOST = "api.b3n.fun"
API_PATH = "/v1/chat/completions"
RETRY_LIMIT = 5
TIMEOUT = 30

def correct_text(text):
    """使用 GPT 纠正文本中的错别字"""
    conn = http.client.HTTPSConnection(API_HOST, timeout=TIMEOUT)
    payload = json.dumps({
        "model": "gpt-4o",
        "max_tokens": 4096,
        "messages": [
            {
                "role": "system",
                "content": "你是一个专业中文文本纠错助手。请纠正以下文本中的错别字，只返回纠正后的文本，不要添加任何解释，也不要增加任何不必要的符号，包括换行符。修正后的文本严禁任何错别字.如果没有错误，请原样返回文本。"
            },
            {
                "role": "user",
                "content": text
            }
        ]
    })
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }

    for attempt in range(RETRY_LIMIT):
        try:
            conn.request("POST", API_PATH, payload, headers)
            res = conn.getresponse()
            data = res.read()
            response = json.loads(data.decode("utf-8"))
            return response['choices'][0]['message']['content']
        except Exception as e:
            print(f"尝试 {attempt + 1} 失败: {e}")
            time.sleep(2 ** attempt)  # 指数退避
        finally:
            conn.close()
    raise Exception("API 调用失败")

def process_markdown_folder():
    """处理 essay6_markdown 文件夹中的所有 markdown 文件"""
    input_folder = "essay6_markdown"
    output_folder = "essay6_markdown_corrected"

    # 创建输出文件夹
    os.makedirs(output_folder, exist_ok=True)

    # 获取所有 markdown 文件
    markdown_files = [f for f in os.listdir(input_folder) if f.endswith('.md')]
    print(f"找到 {len(markdown_files)} 个 Markdown 文件")

    # 使用 tqdm 显示进度
    for filename in tqdm(markdown_files, desc="处理文件"):
        input_path = os.path.join(input_folder, filename)
        output_path = os.path.join(output_folder, filename)

        try:
            # 读取文件内容
            with open(input_path, 'r', encoding='utf-8') as file:
                content = file.read()

            # 分离 frontmatter 和正文
            parts = content.split('---', 2)
            if len(parts) >= 3:
                frontmatter = f"---{parts[1]}---\n"
                text_content = parts[2].strip()
            else:
                frontmatter = ""
                text_content = content

            # 纠正文本
            print(f"\n处理文件: {filename}")
            corrected_text = correct_text(text_content)

            # 组合内容
            corrected_content = f"{frontmatter}\n{corrected_text}"

            # 保存纠正后的文件
            with open(output_path, 'w', encoding='utf-8') as file:
                file.write(corrected_content)

            print(f"已完成: {filename}")

        except Exception as e:
            print(f"处理文件 {filename} 时出错: {str(e)}")
            continue

if __name__ == "__main__":
    try:
        process_markdown_folder()
    except KeyboardInterrupt:
        print("\n程序被用户中断")
    except Exception as e:
        print(f"程序执行出错: {str(e)}")
    finally:
        print("\n处理完成")