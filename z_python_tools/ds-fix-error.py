#!/usr/bin/env python3
# filepath: /home/ebit/ebotian_blog/z_python_tools/ds-fix-error.py
import os
import re
import requests
import argparse
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

class HandwrittenTextCorrector:
    def __init__(self, api_key):
        self.api_key = api_key

    def process_files(self, input_path, output_dir):
        """处理文件或目录"""
        output_dir = Path(output_dir)
        output_dir.mkdir(exist_ok=True)

        files = list(self._collect_files(input_path))
        print(f"找到 {len(files)} 个文件待处理")

        with ThreadPoolExecutor() as executor:
            for file_path in files:
                executor.submit(self._process_single_file, file_path, output_dir)

    def _collect_files(self, path):
        """收集待处理文件"""
        path = Path(path)
        if path.is_file():
            yield path
        else:
            for f in path.rglob('*.md'):  # 同时支持 .md 文件
                if f.is_file():
                    yield f
            for f in path.rglob('*.txt'):  # 保留对 .txt 文件的支持
                if f.is_file():
                    yield f

    def _process_single_file(self, input_file, output_dir):
        """处理单个文件"""
        try:
            raw_text = input_file.read_text(encoding='utf-8')
            print(f"正在处理：{input_file}")

            # 直接用AI增强，跳过本地纠错
            enhanced = self._enhance_with_ai(raw_text)

            # 保存结果
            # 确保正确处理相对路径
            try:
                # 尝试获取相对于父目录的路径
                parent_dir = Path(input_file).parent.parent
                rel_path = Path(input_file).relative_to(parent_dir)
            except ValueError:
                # 如果无法获取相对路径，直接使用文件名
                rel_path = Path(input_file).name

            output_file = output_dir / rel_path
            output_file.parent.mkdir(parents=True, exist_ok=True)

            output_file.write_text(enhanced, encoding='utf-8')
            print(f"成功处理：{input_file} -> {output_file}")
        except Exception as e:
            print(f"处理文件 {input_file} 时出错: {str(e)}")

    def _enhance_with_ai(self, text):
        """大模型上下文增强"""
        chunks = self._split_text(text)
        return '\n'.join([self._call_ai_api(chunk) for chunk in chunks])

    def _split_text(self, text, max_len=2000):
        """智能文本分块"""
        paragraphs = text.split('\n')
        chunks, current_chunk = [], []
        current_length = 0

        for para in paragraphs:
            if current_length + len(para) > max_len and current_chunk:
                chunks.append('\n'.join(current_chunk))
                current_chunk = []
                current_length = 0
            current_chunk.append(para)
            current_length += len(para)

        if current_chunk:
            chunks.append('\n'.join(current_chunk))
        return chunks

    def _call_ai_api(self, text):
        """调用AI接口进行润色"""
        prompt = f"""请对以下手写文本进行出版级修正：
1. 修正错别字和语法错误
2. 保持原有口语化风格
3. 修复标点符号使用
4. 保留原始情感表达
5. 输出直接返回修正文本
6. 保持原样markdown输出格式不变,特别是第一行的日期时间
7. 如果有多行文本，保持原有段落格式
8. 不删减增任何额外内容

待处理文本：
{text}"""

        try:
            response = requests.post(
                "https://api.deepseek.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "deepseek-chat",
                    "messages": [
                        {"role": "system", "content": "你是一位资深随笔日记文学编辑"},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 4000
                },
                timeout=30
            )
            response.raise_for_status()  # 将抛出异常如果状态码不是 200
            return response.json()['choices'][0]['message']['content']
        except requests.exceptions.RequestException as e:
            print(f"API请求错误: {str(e)}")
            return text  # 降级处理
        except (KeyError, IndexError, ValueError) as e:
            print(f"API响应解析错误: {str(e)}")
            return text  # 降级处理
        except Exception as e:
            print(f"API调用未知错误: {str(e)}")
            return text  # 降级处理

def main():
    """主入口函数，处理命令行参数"""
    parser = argparse.ArgumentParser(description='手写文本智能纠错工具')
    parser.add_argument('input_path', help='输入文件或目录路径')
    parser.add_argument('--output', '-o', default='./corrected_notes', help='输出目录')
    parser.add_argument('--api-key', '-k', help='Deepseek API密钥')
    args = parser.parse_args()

    # 获取API密钥，优先级：命令行参数 > 环境变量 > 默认值
    api_key = args.api_key or os.environ.get("DEEPSEEK_API_KEY") or "<MY_API_KEY>"

    corrector = HandwrittenTextCorrector(api_key=api_key)
    corrector.process_files(
        input_path=args.input_path,
        output_dir=args.output
    )

if __name__ == "__main__":
    main()