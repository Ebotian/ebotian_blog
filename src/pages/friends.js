import { DataSet } from "vis-data";
import { Network } from "vis-network";
import Head from "next/head";
import { useRef, useState, useEffect } from "react";
const containerStyle = {
	display: "flex",
	flexDirection: "column",
	gap: "12px",
	padding: "16px",
};
const graphAreaStyle = {
	width: "100%",
	height: "520px",
	border: "1px solid #e5e7eb",
	borderRadius: "8px",
	background: "#fff",
};
const editorStyle = {
	borderTop: "1px solid #e5e7eb",
	paddingTop: "12px",
};

// 四色算法分配颜色，保证相邻节点不同色
function assignFourColoring(nodes, edges) {
	const palette = ["#c0e0d0", "#f6d6c2", "#b5d6e6", "#e6b5d6"];
	// 构建邻接表
	const adj = {};
	nodes.forEach((n) => {
		adj[n.id] = new Set();
	});
	edges.forEach((e) => {
		adj[e.from].add(e.to);
		adj[e.to].add(e.from);
	});
	// 分配颜色
	const colorMap = {};
	nodes.forEach((n) => {
		// 查找邻居已用色
		const used = new Set();
		adj[n.id].forEach((nei) => {
			if (colorMap[nei] !== undefined) used.add(colorMap[nei]);
		});
		// 分配未用色
		for (let i = 0; i < palette.length; i++) {
			if (!used.has(i)) {
				colorMap[n.id] = i;
				break;
			}
		}
	});
	return colorMap;
}
export default function FriendsPage() {
	const [incoming, setIncoming] = useState([]);
	const [outgoing, setOutgoing] = useState([]);
	const [loading, setLoading] = useState(true);
	function addOutgoing(targetUrl) {
		// 检查是否已存在该节点
		let targetNode = graph.nodes.find((n) => n.id === targetUrl);
		let newNodes = [...graph.nodes];
		if (!targetNode) {
			targetNode = { id: targetUrl, title: targetUrl, url: targetUrl };
			newNodes.push(targetNode);
		}
		// 检查是否已存在该边
		const exists = graph.edges.some(
			(e) => e.from === selectedNodeId && e.to === targetUrl
		);
		if (exists) return;
		const newEdges = [
			...graph.edges,
			{ from: selectedNodeId, to: targetUrl, label: "" },
		];
		setGraph({ ...graph, nodes: newNodes, edges: newEdges });
		setOutgoing([...outgoing, targetUrl]);
	}
	function cancelEdit() {
		setSelectedNodeId(null);
		setDraft(null);
	}

	function applyDraft() {
		if (!draft) return;
		const nodes = graph.nodes.map((n) =>
			n.id === draft.id ? { ...n, ...draft } : n
		);
		setGraph({ ...graph, nodes });
		setSelectedNodeId(null);
		setDraft(null);
	}
	const networkRef = useRef(null);
	const nodesRef = useRef(null); // DataSet for nodes
	const edgesRef = useRef(null); // DataSet for edges
	const containerRef = useRef(null);
	const [graph, setGraph] = useState(null);
	const [selectedNodeId, setSelectedNodeId] = useState(null);
	const [draft, setDraft] = useState(null);
	// favicon 缓存，避免重复请求
	const [faviconMap, setFaviconMap] = useState({});
	useEffect(() => {
		if (!graph) return;
		// 只请求未缓存的 favicon
		const uncached = graph.nodes.filter((n) => n.url && !faviconMap[n.id]);
		if (uncached.length === 0) return;
		uncached.forEach((n) => {
			fetch(`/api/favicon?url=${encodeURIComponent(n.url)}`)
				.then((r) => r.json())
				.then((data) => {
					setFaviconMap((prev) => ({ ...prev, [n.id]: data.favicon }));
				})
				.catch(() => {
					setFaviconMap((prev) => ({ ...prev, [n.id]: undefined }));
				});
		});
	}, [graph]);

	useEffect(() => {
		// 首次加载数据
		if (graph === null) {
			fetch("/data/friends-graph.json")
				.then((r) => r.json())
				.then((j) => {
					setGraph(j);
					setLoading(false);
				});
			return;
		}
		if (!graph || !containerRef.current) return;
		// 四色分配
		const colorMap = assignFourColoring(graph.nodes, graph.edges);
		const palette = ["#c0e0d0", "#f6d6c2", "#b5d6e6", "#e6b5d6"];
		// 初始化 DataSet（只初始化一次）
		if (!nodesRef.current) nodesRef.current = new DataSet();
		if (!edgesRef.current) edgesRef.current = new DataSet();
		// 生成 fallback label 编号
		const fallbackLabels = {};
		graph.nodes.forEach((n, idx) => {
			fallbackLabels[n.id] = `朋友#${String(idx + 1).padStart(4, "0")}`;
		});
		// 首次渲染 new Network
		if (!networkRef.current) {
			const options = {
				physics: {
					enabled: true,
					solver: "repulsion",
					repulsion: {
						nodeDistance: 150,
						centralGravity: 0.1,
						springLength: 120,
						springConstant: 0.05,
						damping: 0.95,
					},
					stabilization: {
						enabled: true,
						iterations: 200,
						updateInterval: 25,
					},
				},
				nodes: {
					shape: "box",
					shapeProperties: { borderRadius: 12 },
					margin: 10,
					font: { size: 14 },
					imagePadding: 6,
					brokenImage: undefined,
				},
				edges: {
					arrows: { to: { enabled: true, scaleFactor: 0.7 } },
				},
				interaction: {
					dragNodes: true,
					dragView: true,
				},
			};
			networkRef.current = new Network(
				containerRef.current,
				{ nodes: nodesRef.current, edges: edgesRef.current },
				options
			);
			networkRef.current.on("selectNode", (params) => {
				const id = params.nodes[0];
				setSelectedNodeId(id);
				const n = graph.nodes.find((x) => x.id === id);
				setDraft({ ...n });
				setIncoming(graph.edges.filter((e) => e.to === id).map((e) => e.from));
				setOutgoing(graph.edges.filter((e) => e.from === id).map((e) => e.to));
				setTimeout(() => {
					const input = document.getElementById("newOutgoing");
					if (input) input.focus();
				}, 0);
			});
			networkRef.current.on("deselectNode", () => {
				setSelectedNodeId(null);
				setDraft(null);
			});
			networkRef.current.on("doubleClick", (params) => {
				if (params.nodes && params.nodes.length > 0) {
					const id = params.nodes[0];
					const n = graph.nodes.find((x) => x.id === id);
					if (n && n.url) {
						window.open(n.url, "_blank", "noopener");
					}
				}
			});
		}
		// 增量同步 nodes
		const nodeIds = new Set(nodesRef.current.getIds());
		const newNodeIds = new Set(graph.nodes.map((n) => n.id));
		// 删除不存在的节点
		nodeIds.forEach((id) => {
			if (!newNodeIds.has(id)) nodesRef.current.remove(id);
		});
		// 新增或更新节点
		graph.nodes.forEach((n) => {
			const hasFavicon = faviconMap[n.id];
			// 调试输出
			if (hasFavicon) {
				console.log("Node", n.id, "favicon:", hasFavicon);
			}
			// vis-network 只有 shape: 'image' 时 image 属性才生效
			nodesRef.current.update({
				id: n.id,
				label: hasFavicon ? undefined : fallbackLabels[n.id],
				title: n.title || n.url,
				image: hasFavicon,
				shape: hasFavicon ? "image" : "box",
				shapeProperties: { borderRadius: 12 },
				margin: 10,
				font: { size: 14 },
				color: { background: palette[colorMap[n.id]], border: "#888" },
			});
		});
		// 增量同步 edges
		const edgeIds = new Set(edgesRef.current.getIds());
		const newEdgeIds = new Set(graph.edges.map((e) => `${e.from}_${e.to}`));
		edgeIds.forEach((id) => {
			if (!newEdgeIds.has(id)) edgesRef.current.remove(id);
		});
		graph.edges.forEach((e) => {
			edgesRef.current.update({
				id: `${e.from}_${e.to}`,
				from: e.from,
				to: e.to,
				arrows: "to",
			});
		});
	}, [graph, faviconMap]);
	function removeIncoming(fromId) {
		const edges = graph.edges.filter(
			(e) => !(e.from === fromId && e.to === selectedNodeId)
		);
		setGraph({ ...graph, edges });
		setIncoming(incoming.filter((x) => x !== fromId));
	}
	function removeOutgoing(targetId) {
		const edges = graph.edges.filter(
			(e) => !(e.from === selectedNodeId && e.to === targetId)
		);
		setGraph({ ...graph, edges });
		setOutgoing(outgoing.filter((x) => x !== targetId));
	}
	function deleteNode(nodeId) {
		if (!window.confirm("确定要删除该节点及其所有相关边吗？")) return;
		const nodes = graph.nodes.filter((n) => n.id !== nodeId);
		const edges = graph.edges.filter(
			(e) => e.from !== nodeId && e.to !== nodeId
		);
		setGraph({ nodes, edges });
		setSelectedNodeId(null);
		setDraft(null);
	}
	function exportJSON() {
		const dataStr = JSON.stringify(graph, null, 2);
		const blob = new Blob([dataStr], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "friends-graph.json";
		a.click();
		URL.revokeObjectURL(url);
	}

	if (loading) return <div style={{ padding: 16 }}>Loading...</div>;

	return (
		<div style={containerStyle}>
			<Head>
				<title>朋友图</title>
			</Head>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<h1>朋友图</h1>
				<div>
					<button
						onClick={() =>
							fetch("/data/friends-graph.json")
								.then((r) => r.json())
								.then((j) => setGraph(j))
						}
					>
						刷新数据
					</button>
					<button style={{ marginLeft: 8 }} onClick={exportJSON}>
						导出 JSON
					</button>
				</div>
			</div>
			<div ref={containerRef} style={graphAreaStyle} />
			<div style={editorStyle}>
				{selectedNodeId ? (
					<div>
						<h3>
							编辑：{selectedNodeId}
							<button
								style={{
									marginLeft: 12,
									color: "#fff",
									background: "#ef4444",
									border: "none",
									borderRadius: 4,
									padding: "2px 8px",
									cursor: "pointer",
								}}
								onClick={() => deleteNode(selectedNodeId)}
							>
								删除节点
							</button>
						</h3>
						<div style={{ display: "flex", gap: 12 }}>
							<div style={{ flex: 1 }}>
								<div>
									<label>Title / 名称</label>
									<input
										style={{ width: "100%" }}
										value={draft?.title || ""}
										onChange={(e) =>
											setDraft({ ...draft, title: e.target.value })
										}
									/>
								</div>
								<div>
									<label>URL</label>
									<input
										style={{ width: "100%" }}
										value={draft?.url || ""}
										onChange={(e) =>
											setDraft({ ...draft, url: e.target.value })
										}
									/>
								</div>
							</div>
						</div>

						<hr />

						<div style={{ display: "flex", gap: 24 }}>
							<div style={{ flex: 1 }}>
								<h4>此站点链接（incoming）</h4>
								<p style={{ color: "#6b7280" }}>
									下面显示指向当前节点的站点。可直接删除 incoming 边。
								</p>
								<ul>
									{incoming.map((id) => (
										<li key={id}>
											{id}
											<button
												style={{ marginLeft: 8 }}
												onClick={() => removeIncoming(id)}
											>
												删除
											</button>
										</li>
									))}
								</ul>
							</div>

							<div style={{ flex: 1 }}>
								<h4>站点链接到（outgoing）</h4>
								<p style={{ color: "#6b7280" }}>
									下面显示当前节点指向的目标。新增默认展开并把光标放到输入框。
								</p>
								<ul>
									{outgoing.map((id) => (
										<li key={id}>
											{id}{" "}
											<button
												style={{ marginLeft: 8 }}
												onClick={() => removeOutgoing(id)}
											>
												删除
											</button>
										</li>
									))}
								</ul>
								<div style={{ marginTop: 8 }}>
									<input
										id="newOutgoing"
										placeholder="输入目标节点URL并回车添加"
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												const val = e.target.value.trim();
												if (val) {
													addOutgoing(val);
													e.target.value = "";
												}
											}
										}}
									/>
								</div>
							</div>
						</div>

						<div style={{ marginTop: 12 }}>
							<button onClick={() => applyDraft()}>确认 (Enter)</button>
							<button style={{ marginLeft: 8 }} onClick={cancelEdit}>
								取消 (Esc)
							</button>
						</div>
					</div>
				) : (
					<div>点击图中节点以展开编辑区。</div>
				)}
			</div>
		</div>
	);
}
