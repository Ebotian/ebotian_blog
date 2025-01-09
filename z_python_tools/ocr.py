import os
import requests
import json
from datetime import datetime
from tqdm import tqdm
import base64
import time

# 百度API配置
API_KEY = ""
SECRET_KEY = ""

def get_access_token():
    """
    获取百度API的access_token
    """
    url = "https://aip.baidubce.com/oauth/2.0/token"
    params = {
        "grant_type": "client_credentials",
        "client_id": API_KEY,
        "client_secret": SECRET_KEY
    }

    try:
        response = requests.post(url, params=params)
        if response.status_code == 200:
            return response.json().get("access_token")
        else:
            print(f"获取access_token失败: {response.text}")
            return None
    except Exception as e:
        print(f"获取access_token时出错: {str(e)}")
        return None

def extract_text_from_image(image_path, access_token):
    """使用百度手写OCR从图片中提取文字"""
    try:
        # 读取图片并转换为base64
        with open(image_path, 'rb') as f:
            image = base64.b64encode(f.read()).decode('utf-8')

        # API请求URL
        url = f"https://aip.baidubce.com/rest/2.0/ocr/v1/handwriting?access_token={access_token}"

        # 请求参数
        payload = {
            "image": image,
            "detect_direction": "true",
            "probability": "true"
        }

        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        }

        # 发送请求
        response = requests.post(url, data=payload, headers=headers)

        if response.status_code == 200:
            result = response.json()

            if 'words_result' in result:
                # 提取文字结果
                texts = [item['words'] for item in result['words_result']]
                return '\n'.join(texts)
            else:
                print(f"识别结果异常: {result}")
                return None
        else:
            print(f"API请求失败: {response.text}")
            return None

    except Exception as e:
        print(f"处理图片时出错 {image_path}: {str(e)}")
        return None

def process_essay_folder():
    """处理essay6文件夹中的所有图片"""
    input_folder = "essay6"
    output_folder = "essay6_markdown"

    # 获取access_token
    access_token = get_access_token()
    if not access_token:
        print("获取access_token失败，程序退出")
        return

    # 创建输出文件夹
    os.makedirs(output_folder, exist_ok=True)

    # 支持的图片格式
    image_extensions = ('.jpg', '.jpeg', '.png')

    # 获取所有图片文件
    image_files = [f for f in os.listdir(input_folder)
                  if f.lower().endswith(image_extensions)]

    print(f"找到 {len(image_files)} 个图片文件")

    # 使用tqdm显示进度条
    for filename in tqdm(image_files, desc="处理图片"):
        image_path = os.path.join(input_folder, filename)

        print(f"\n开始处理: {filename}")

        # 添加重试机制
        max_retries = 3
        extracted_text = None

        for attempt in range(max_retries):
            try:
                print(f"尝试 {attempt + 1}/{max_retries}")
                extracted_text = extract_text_from_image(image_path, access_token)
                if extracted_text:
                    break
                print(f"尝试 {attempt + 1}/{max_retries} 失败，准备重试...")
                time.sleep(2)
            except Exception as e:
                print(f"尝试 {attempt + 1}/{max_retries} 出错: {str(e)}")
                if attempt < max_retries - 1:
                    time.sleep(2)
                    continue

        if extracted_text:
            # 生成对应的markdown文件名
            md_filename = os.path.splitext(filename)[0] + ".md"
            md_path = os.path.join(output_folder, md_filename)

            # 生成markdown文件内容
            current_date = datetime.now().strftime("%Y-%m-%d")
            markdown_content = f"""---
date: {current_date}
---

{extracted_text}
"""

            # 保存markdown文件
            try:
                with open(md_path, 'w', encoding='utf-8') as md_file:
                    md_file.write(markdown_content)
                print(f"已完成: {filename} -> {md_filename}")
            except Exception as e:
                print(f"保存文件时出错 {md_filename}: {str(e)}")
        else:
            print(f"跳过: {filename} (处理失败)")

if __name__ == "__main__":
    try:
        process_essay_folder()
    except KeyboardInterrupt:
        print("\n程序被用户中断")
    except Exception as e:
        print(f"程序执行出错: {str(e)}")
    finally:
        print("\n处理完成")