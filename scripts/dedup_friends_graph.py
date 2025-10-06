import json
from urllib.parse import urlparse, urlunparse
import sys
import os

# 统一url，末尾加/
def normalize_url(url):
    parsed = urlparse(url)
    # 统一加上末尾斜杠
    path = parsed.path
    if not (path.endswith('/') or path.endswith('*'))and path != '':
        path = path + '/'
    elif path == '':
        path = '/'
    norm = parsed._replace(path=path, params='', query='', fragment='')
    return urlunparse(norm)

# 路径
json_path = os.path.join(os.path.dirname(__file__), '../public/data/friends-graph.json')

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# 合并节点
dedup_nodes = {}
for n in data['nodes']:
    norm_url = normalize_url(n['url'])
    if norm_url not in dedup_nodes:
        n['url'] = norm_url
        dedup_nodes[norm_url] = n
    # 可选：保留第一个title，或用后面的覆盖

# 合并边
dedup_edges = {}
for e in data['edges']:
    from_url = normalize_url(e['from'])
    to_url = normalize_url(e['to'])
    if from_url == to_url:
        continue  # 跳过自指边
    key = (from_url, to_url)
    if key not in dedup_edges:
        e['from'] = from_url
        e['to'] = to_url
        dedup_edges[key] = e

# 写回
data['nodes'] = list(dedup_nodes.values())
data['edges'] = list(dedup_edges.values())
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"已合并去重，节点数: {len(data['nodes'])}，边数: {len(data['edges'])}")
