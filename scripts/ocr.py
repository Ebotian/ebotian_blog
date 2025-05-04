import os
import base64
import requests
from tqdm import tqdm
from tenacity import retry, stop_after_attempt, wait_fixed

API_KEY = ""
SECRET_KEY = ""
OCR_URL = "https://aip.baidubce.com/rest/2.0/ocr/v1/handwriting"

def get_access_token():
    url = "https://aip.baidubce.com/oauth/2.0/token"
    params = {"grant_type": "client_credentials", "client_id": API_KEY, "client_secret": SECRET_KEY}
    return str(requests.post(url, params=params).json().get("access_token"))

@retry(stop=stop_after_attempt(5), wait=wait_fixed(2))
def ocr_image(image_path, access_token):
    with open(image_path, "rb") as f:
        img = base64.b64encode(f.read())
    params = {"image": img}
    url = OCR_URL + "?access_token=" + access_token
    headers = {'content-type': 'application/x-www-form-urlencoded'}
    response = requests.post(url, data=params, headers=headers, timeout=10)
    response.raise_for_status()
    return response.json()

def get_image_files(directory):
    exts = ('.jpg', '.jpeg', '.png', '.bmp', '.tiff')
    for root, _, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(exts):
                yield os.path.join(root, file)

import re
from datetime import datetime
# filepath: /home/ebit/ebotian_blog/scripts/ocr.py
def save_result_to_md(img_path, ocr_result):
    # 提取图片名中的数字作为页码
    img_name = os.path.basename(img_path)
    match = re.search(r'_(\d+)\.', img_name)
    if match:
        page_num = match.group(1)
    else:
        page_num = "未知"
    md_name = f"第六本-{int(page_num):02d}页.md"
    md_path = os.path.join(os.path.dirname(img_path), md_name)
    # 提取图片名中的日期
    date_match = re.search(r'(\d{4}-\d{2}-\d{2})', img_name)
    if date_match:
        date_str = date_match.group(1)
    else:
        date_str = datetime.now().strftime("%Y-%m-%d")
    lines = []
    lines.append(f"---\ndate: {date_str}\n---\n\n")
    #lines.append(f"{int(datetime.now().timestamp())}\n")
    if "words_result" in ocr_result:
        for item in ocr_result["words_result"]:
            lines.append(item.get("words", "") + "\n")
    else:
        lines.append(f"**Error:** {ocr_result.get('error', str(ocr_result))}\n")
    with open(md_path, "w", encoding="utf-8") as f:
        f.writelines(lines)

def main(img_dir):
    access_token = get_access_token()
    image_files = list(get_image_files(img_dir))
    for img_path in tqdm(image_files, desc="OCR Processing"):
        try:
            result = ocr_image(img_path, access_token)
            save_result_to_md(img_path, result)
        except Exception as e:
            save_result_to_md(img_path, {"error": str(e)})
    print("OCR完成，结果已保存为对应图片名的md文件。")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("用法: python ocr.py <图片目录>")
    else:
        main(sys.argv[1])