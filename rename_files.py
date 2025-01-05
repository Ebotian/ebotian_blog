import os
import re

def extract_number(filename):
    """从扫描全能王文件名中提取数字"""
    match = re.search(r'23.56_(\d+)', filename)
    if match:
        return int(match.group(1))
    return 0

def rename_files():
    """按自然顺序重命名文件"""
    # 设置文件夹路径
    folder_path = "essay6_markdown_corrected"

    # 确保文件夹存在
    if not os.path.exists(folder_path):
        print(f"文件夹 {folder_path} 不存在！")
        return

    # 获取所有markdown文件
    files = [f for f in os.listdir(folder_path) if f.endswith('.md')]

    # 按原始数字排序
    files.sort(key=extract_number)

    # 创建临时文件夹
    temp_folder = os.path.join(folder_path, "temp")
    os.makedirs(temp_folder, exist_ok=True)

    # 第一步：重命名为临时文件
    print("第一步：创建临时文件...")
    for index, old_name in enumerate(files, start=1):
        old_path = os.path.join(folder_path, old_name)
        temp_name = f"temp_{index:03d}.md"
        temp_path = os.path.join(temp_folder, temp_name)

        try:
            os.rename(old_path, temp_path)
            print(f"临时重命名: {old_name} -> {temp_name}")
        except Exception as e:
            print(f"重命名失败 {old_name}: {str(e)}")

    # 第二步：按自然顺序重命名
    print("\n第二步：按自然顺序重命名...")
    temp_files = sorted(os.listdir(temp_folder))
    for index, temp_name in enumerate(temp_files, start=1):
        temp_path = os.path.join(temp_folder, temp_name)
        new_name = f"大学随笔第6本{index:02d}页.md"  # 使用两位数页码
        new_path = os.path.join(folder_path, new_name)

        try:
            os.rename(temp_path, new_path)
            print(f"最终重命名: {temp_name} -> {new_name}")
        except Exception as e:
            print(f"重命名失败 {temp_name}: {str(e)}")

    # 删除临时文件夹
    try:
        os.rmdir(temp_folder)
        print("\n临时文件夹已清理")
    except Exception as e:
        print(f"删除临时文件夹失败: {str(e)}")

if __name__ == "__main__":
    try:
        rename_files()
        print("\n重命名完成！")
    except Exception as e:
        print(f"程序执行出错: {str(e)}")