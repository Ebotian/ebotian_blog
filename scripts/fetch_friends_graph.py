
import requests
from bs4 import BeautifulSoup
import json
from urllib.parse import urljoin
import os
import re

# 友链页 URL
FROM_URL = "https://lovemen.cc/"
FRIEND_PAGE = "https://lovemen.cc/links.html"
# 本站节点 URL（可自定义）
SELF_URL = FRIEND_PAGE
# 原有 JSON 路径
JSON_PATH = os.path.join(os.path.dirname(__file__), "../public/data/friends-graph.json")

# 读取原有 JSON
if os.path.exists(JSON_PATH):
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        old_graph = json.load(f)
    old_nodes = {n["url"]: n for n in old_graph.get("nodes", [])}
    old_edges = {(e["from"], e["to"]): e for e in old_graph.get("edges", [])}
else:
    old_nodes = {}
    old_edges = {}

# 抓取页面
resp = requests.get(FRIEND_PAGE, timeout=10)
resp.raise_for_status()
soup = BeautifulSoup(resp.text, "html.parser")


# 规范化url，保留末尾斜杠，只去除锚点和参数
from urllib.parse import urlparse, urlunparse
def normalize_url(url):
    parsed = urlparse(url)
    norm = parsed._replace(params='', query='', fragment='')
    return urlunparse(norm)

# 用FROM_URL做正则比对，排除本站所有url
site_pattern = re.compile(rf'^{re.escape(FROM_URL)}([/?#].*)?$', re.IGNORECASE)
links = set()
for a in soup.find_all("a", href=True):
    href = a["href"].strip()
    if href.startswith("http://") or href.startswith("https://"):
        norm = normalize_url(href)
        if not site_pattern.match(norm):
            links.add(norm)
    elif href.startswith("/"):
        abs_url = urljoin(FRIEND_PAGE, href)
        norm = normalize_url(abs_url)
        if not site_pattern.match(norm):
            links.add(norm)



# 合并节点，严格以url为唯一，且只保留FROM_URL为本站节点
all_nodes = {}
# 先保留所有旧节点，但只保留第一个出现的url，且排除SELF_URL及其子路径，只保留FROM_URL
for n in old_nodes.values():
    u = n["url"]
    # 排除SELF_URL及其子路径，只保留FROM_URL
    if u == SELF_URL or (u.startswith(FROM_URL) and u != FROM_URL):
        continue
    if u not in all_nodes:
        all_nodes[u] = n
# 保证FROM_URL只保留一个，title为“本站”
all_nodes[FROM_URL] = {"title": "本站", "url": FROM_URL}

# 新抓取的友链，排除FROM_URL和SELF_URL本身
for url in links:
    if url == FROM_URL or url == SELF_URL or (url.startswith(FROM_URL) and url != FROM_URL):
        continue
    if url not in all_nodes:
        all_nodes[url] = {"title": f"朋友#{str(len(all_nodes)).zfill(4)}", "url": url}



# 合并边，from 统一用 FROM_URL，且不允许 from==to
all_edges = dict(old_edges)
for url in links:
    if url == FROM_URL or url == SELF_URL or (url.startswith(FROM_URL) and url != FROM_URL):
        continue
    key = (FROM_URL, url)
    if key not in all_edges and FROM_URL != url:
        all_edges[key] = {"from": FROM_URL, "to": url, "label": ""}

# 生成最终 graph
graph = {
    "nodes": list(all_nodes.values()),
    "edges": list(all_edges.values()),
}

# 保存回原文件
with open(JSON_PATH, "w", encoding="utf-8") as f:
    json.dump(graph, f, ensure_ascii=False, indent=2)

print(f"已合并 {len(links)} 个新友链，节点总数: {len(all_nodes)}，结果已保存到 {JSON_PATH}")
