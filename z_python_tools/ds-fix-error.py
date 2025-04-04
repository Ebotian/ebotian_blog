#!/usr/bin/env python3
# filepath: /home/ebit/ebotian_blog/z_python_tools/ds-fix-error.py
import os
import re
import requests
import argparse
import json
import time
import random
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm  # 用于显示进度条

class HandwrittenTextCorrector:
    def __init__(self, api_key, max_workers=3):
        self.api_key = api_key
        self.max_workers = max_workers
        self.succeeded = 0
        self.retried_files = []

    def process_files(self, input_path, output_dir):
        """处理文件或目录"""
        output_dir = Path(output_dir)
        output_dir.mkdir(exist_ok=True)

        files = list(self._collect_files(input_path))
        print(f"找到 {len(files)} 个文件待处理")

        # 第一轮处理
        failed_files = self._process_batch(files, output_dir)

        # 持续处理失败的文件直到全部成功
        retry_round = 1
        while failed_files:
            print(f"\n开始第 {retry_round} 轮重试 ({len(failed_files)} 个文件)...")
            # 加入随机等待，避免API限流
            time.sleep(5 + random.randint(1, 5))
            failed_files = self._process_batch(failed_files, output_dir)
            retry_round += 1

        print(f"\n全部处理完成! 成功: {self.succeeded}")
        if self.retried_files:
            print(f"其中 {len(self.retried_files)} 个文件经过重试后成功:")
            for f in self.retried_files[:10]:  # 只显示前10个
                print(f"  - {f}")
            if len(self.retried_files) > 10:
                print(f"  ...以及其他 {len(self.retried_files) - 10} 个文件")

    def _process_batch(self, files, output_dir):
        """处理一批文件，返回处理失败的文件列表"""
        failed_files = []

        # 使用 tqdm 显示进度条，限制最大并行工作线程数
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            futures = {executor.submit(self._process_single_file, file_path, output_dir): file_path for file_path in files}
            for future in tqdm(as_completed(futures), total=len(futures), desc="处理进度"):
                file_path = futures[future]
                try:
                    result = future.result()
                    if not result:
                        failed_files.append(file_path)
                        print(f"将重试: {file_path}")
                        self.retried_files.append(str(file_path))
                    else:
                        self.succeeded += 1
                except Exception as e:
                    print(f"处理文件 {file_path} 时出错: {str(e)}")
                    failed_files.append(file_path)
                    self.retried_files.append(str(file_path))

        return failed_files

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

            # 直接用AI增强，跳过本地纠错
            enhanced = self._enhance_with_ai(raw_text)

            # 检查是否实际进行了修正
            if enhanced == raw_text:
                return False  # 文件内容没有变化，可能是API调用失败

            # 保存结果
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
            return True
        except Exception as e:
            print(f"处理文件 {input_file} 时出错: {str(e)}")
            return False

    def _enhance_with_ai(self, text):
        """大模型上下文增强 - 持续尝试直到成功"""
        chunks = self._split_text(text)
        enhanced_chunks = []

        for chunk in chunks:
            # 无限重试，直到成功
            attempt = 1
            backoff_time = 5  # 初始等待时间5秒
            max_backoff = 60  # 最大等待时间60秒

            while True:
                try:
                    enhanced = self._call_ai_api(chunk)
                    enhanced_chunks.append(enhanced)
                    break  # 成功则退出重试循环
                except Exception as e:
                    print(f"API调用失败 (第{attempt}次尝试): {str(e)}")

                    # 指数退避策略
                    sleep_time = min(backoff_time * (1.5 ** (attempt - 1)), max_backoff)
                    sleep_time += random.uniform(0, 2)  # 添加随机抖动

                    print(f"等待 {sleep_time:.1f} 秒后重试...")
                    time.sleep(sleep_time)
                    attempt += 1

        return '\n'.join(enhanced_chunks)

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

    # def _call_ai_api(self, text):
    #     """调用AI接口进行润色 - 使用FIM (Fill-In-Middle) 技术"""

    #     # 准备FIM模式的提示词
    #     prompt_prefix = "请对以下经过OCR转录的手写文本进行出版级修正,包括但不限于以下方面：\n\n 1.修正错别字和语法错误 2. 保持原有风格 3. 修复标点符号使用 4. 保留原始情感表达 5. 输出直接返回修正文本 6. 保持原样markdown输出格式不变,特别是第一行的日期时间 7. 如果有多行文本，保持原有段落格式 8. 不删减增任何额外内容 \n\n开始文本：\n"
    #     prompt_suffix = "\n\n修正后的文本："

    #     payload = json.dumps({
    #         "model": "deepseek-chat",
    #         "prompt": prompt_prefix,
    #         "suffix": prompt_suffix,
    #         "max_tokens": 4000,
    #         "temperature": 0.7,
    #         "echo": False,
    #         "stream": False,
    #         "frequency_penalty": 0,
    #         "presence_penalty": 0,
    #         "stop": None
    #     })

    #     headers = {
    #         'Content-Type': 'application/json',
    #         'Accept': 'application/json',
    #         'Authorization': f'Bearer {self.api_key}'
    #     }

    #     response = requests.post(
    #         "https://api.deepseek.com/beta/completions",
    #         headers=headers,
    #         data=payload,
    #         timeout=120  # 增加超时时间到120秒
    #     )

    #     response.raise_for_status()
    #     result = response.json()

    #     # 从补全API响应中提取修正后的文本
    #     if 'choices' in result and len(result['choices']) > 0:
    #         corrected_text = result['choices'][0]['text'].strip()

    #         # 有时模型可能会添加额外引用或格式，尝试提取纯文本
    #         if "```" in corrected_text:
    #             # 尝试提取代码块中的内容
    #             match = re.search(r"```(?:markdown|md)?\n([\s\S]*?)\n```", corrected_text)
    #             if match:
    #                 corrected_text = match.group(1).strip()

    #         # 如果模型输出了指令而不是修正文本，则返回原始文本
    #         instruction_markers = ["应该", "需要", "可以", "我会", "我已经", "以下是"]
    #         if any(marker in corrected_text[:50] for marker in instruction_markers):
    #             return text

    #         return corrected_text
    #     else:
    #         print(f"API响应未包含预期的文本内容: {result}")
    #         return text
    def _call_ai_api(self, text):
        """调用AI接口进行润色 - 使用chat模式"""

        system_prompt = "你是一位资深手写文本编辑专家，专门负责修正OCR转录文本中的错误。"
        user_prompt = f"""指令:请对以下经过OCR转录的手写文本进行出版级修正，包括但不限于以下方面：
1. 修正错别字和语法错误
2. 保持原有风格
3. 修复标点符号使用
4. 保留原始情感表达
5. 输出直接返回修正文本
6. 保持原样markdown输出格式不变，特别是第一行的日期时间
7. 如果有多行文本，保持原有段落格式
8. 不删减增任何额外内容,包括修正说明
9. 不能添加诸如"修正说明"一类的修正解释或者说明

待处理文本：
{text}"""

        payload = json.dumps({
            "model": "deepseek-chat",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 4000,
            "frequency_penalty": 0,
            "presence_penalty": 0,
            "stream": False,
            "stop": None
        })

        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': f'Bearer {self.api_key}'
        }

        response = requests.post(
            "https://api.deepseek.com/v1/chat/completions",  # 使用chat API
            headers=headers,
            data=payload,
            timeout=120  # 增加超时时间到120秒
        )

        response.raise_for_status()
        result = response.json()

        # 从chat API响应中提取修正后的文本
        if 'choices' in result and len(result['choices']) > 0:
            corrected_text = result['choices'][0]['message']['content'].strip()

            # 有时模型可能会添加额外引用或格式，尝试提取纯文本
            if "```" in corrected_text:
                # 尝试提取代码块中的内容
                match = re.search(r"```(?:markdown|md)?\n([\s\S]*?)\n```", corrected_text)
                if match:
                    corrected_text = match.group(1).strip()

            # 如果模型输出了指令而不是修正文本，则返回原始文本
            instruction_markers = ["应该", "需要", "可以", "我会", "我已经", "以下是"]
            if any(marker in corrected_text[:50] for marker in instruction_markers):
                return text

            return corrected_text
        else:
            print(f"API响应未包含预期的文本内容: {result}")
            return text

def main():
    """主入口函数，处理命令行参数"""
    parser = argparse.ArgumentParser(description='手写文本智能纠错工具')
    parser.add_argument('input_path', help='输入文件或目录路径')
    parser.add_argument('--output', '-o', default='./corrected_notes', help='输出目录')
    parser.add_argument('--api-key', '-k', help='Deepseek API密钥')
    parser.add_argument('--workers', '-w', type=int, default=2, help='最大并行处理数量 (默认: 2)')
    args = parser.parse_args()

    # 获取API密钥，优先级：命令行参数 > 环境变量 > 默认值
    api_key = args.api_key or os.environ.get("DEEPSEEK_API_KEY") or "<your_default_api_key>"
    if not api_key or api_key == "<your_default_api_key>":
        print("请提供有效的API密钥")
        return

    corrector = HandwrittenTextCorrector(api_key=api_key, max_workers=args.workers)
    corrector.process_files(
        input_path=args.input_path,
        output_dir=args.output
    )

if __name__ == "__main__":
    main()