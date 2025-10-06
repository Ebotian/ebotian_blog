import { DataSet } from "vis-data";
import { Network } from "vis-network";
import Head from "next/head";
import { useRef, useState, useEffect } from "react";
import Card from "../components/Card";
import Profile from "../components/Profile";

// 样式常量
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
	const adj = {};
	nodes.forEach((n) => {
		adj[n.url] = new Set();
	});
	edges.forEach((e) => {
		if (adj[e.from] && adj[e.to]) {
			adj[e.from].add(e.to);
			adj[e.to].add(e.from);
		}
	});
	const colorMap = {};
	nodes.forEach((n) => {
		const used = new Set();
		adj[n.url].forEach((nei) => {
			if (colorMap[nei] !== undefined) used.add(colorMap[nei]);
		});
		for (let i = 0; i < palette.length; i++) {
			if (!used.has(i)) {
				colorMap[n.url] = i;
				break;
			}
		}
	});
	return colorMap;
}

// Helper: 获取下一个“朋友#编号”title
function getNextFriendTitle(nodes) {
	let maxNum = 0;
	nodes.forEach((n) => {
		const m = /^朋友#(\d{4})$/.exec(n.title);
		if (m) {
			const num = parseInt(m[1], 10);
			if (num > maxNum) maxNum = num;
		}
	});
	return `朋友#${String(maxNum + 1).padStart(4, "0")}`;
}

export default function FriendsPage() {
	// 状态声明
	const [graph, setGraph] = useState(null);
	const [selectedNodeUrl, setSelectedNodeUrl] = useState(null);
	const [draft, setDraft] = useState(null);
	const [incoming, setIncoming] = useState([]);
	const [outgoing, setOutgoing] = useState([]);
	const [loading, setLoading] = useState(true);
	const [faviconMap, setFaviconMap] = useState({});
	const [incomingCollapsed, setIncomingCollapsed] = useState(true);
	const [outgoingCollapsed, setOutgoingCollapsed] = useState(true);

	// refs
	const networkRef = useRef(null);
	const nodesRef = useRef(null);
	const edgesRef = useRef(null);
	const containerRef = useRef(null);

	// 响应式布局，模仿正文页面
	const [displayMode, setDisplayMode] = useState({
		isMobile: false,
		useCompactProfile: false,
		isLargeScreen: false,
	});
	useEffect(() => {
		function handleResize() {
			const width = window.innerWidth;
			const height = window.innerHeight;
			const isMobileView = width < 768;
			const isLargeView = width >= 1024;
			const needsCompact =
				!isMobileView && ((!isLargeView && width < 1024) || height < 650);
			setDisplayMode({
				isMobile: isMobileView,
				useCompactProfile: needsCompact,
				isLargeScreen: isLargeView,
			});
		}
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);
	const profileWidthClass = displayMode.useCompactProfile ? "w-48" : "w-56";

	// vis-network 初始化和同步
	useEffect(() => {
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
		const colorMap = assignFourColoring(graph.nodes, graph.edges);
		const palette = ["#c0e0d0", "#f6d6c2", "#b5d6e6", "#e6b5d6"];
		if (!nodesRef.current) nodesRef.current = new DataSet();
		if (!edgesRef.current) edgesRef.current = new DataSet();
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
				const url = params.nodes[0];
				setSelectedNodeUrl(url);
				// 每次都从最新 graph 查找 title/url 及 incoming/outgoing
				setGraph((g) => {
					const n = g.nodes.find((x) => x.url === url);
					// outgoing: 以 from=url 的所有 to
					const outgoingList = g.edges
						.filter((e) => e.from === url)
						.map((e) => e.to);
					// incoming: 以 to=url 的所有 from
					const incomingList = g.edges
						.filter((e) => e.to === url)
						.map((e) => e.from);
					setDraft(n ? { ...n } : {});
					setOutgoing(outgoingList);
					setIncoming(incomingList);
					setIncomingCollapsed(true);
					setOutgoingCollapsed(true);
					setTimeout(() => {
						const input = document.getElementById("newOutgoing");
						if (input) input.focus();
					}, 0);
					return g;
				});
			});
			networkRef.current.on("deselectNode", () => {
				setSelectedNodeUrl(null);
				setDraft(null);
			});
			networkRef.current.on("doubleClick", (params) => {
				if (params.nodes && params.nodes.length > 0) {
					const url = params.nodes[0];
					const n = graph.nodes.find((x) => x.url === url);
					if (n && n.url) {
						window.open(n.url, "_blank", "noopener");
					}
				}
			});
		}
		// 增量同步 nodes
		const nodeUrls = new Set(nodesRef.current.getIds());
		const newNodeUrls = new Set(graph.nodes.map((n) => n.url));
		nodeUrls.forEach((url) => {
			if (!newNodeUrls.has(url)) nodesRef.current.remove(url);
		});
		graph.nodes.forEach((n) => {
			nodesRef.current.update({
				id: n.url,
				label: n.title,
				title: n.title || n.url,
				shape: "box",
				shapeProperties: { borderRadius: 12 },
				margin: 10,
				font: { size: 14 },
				color: { background: palette[colorMap[n.url]], border: "#888" },
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
	}, [graph]);

	return (
		<div className="relative min-h-screen font-mono bg-[var(--bg)]">
			<Head>
				<title>朋友图</title>
			</Head>
			{/* 左侧 Profile 区域 */}
			{!displayMode.isMobile && !displayMode.isLargeScreen && (
				<div
					className={`fixed left-4 top-1/2 -translate-y-1/2 z-20 ${profileWidthClass}`}
				>
					<Profile compact={displayMode.useCompactProfile} />
				</div>
			)}
			<div
				className={`pt-8 pb-20 px-4 sm:px-8 ${
					!displayMode.isMobile && !displayMode.isLargeScreen
						? displayMode.useCompactProfile
							? "md:pl-56"
							: "md:pl-64"
						: ""
				}`}
			>
				<div className="max-w-7xl mx-auto">
					<div className="lg:flex lg:justify-center lg:gap-8">
						<aside
							className={`hidden lg:block ${profileWidthClass} flex-shrink-0`}
						>
							<div className="sticky top-20 h-fit">
								<Profile compact={displayMode.useCompactProfile} />
							</div>
						</aside>
						<div className="w-full max-w-2xl flex-shrink min-w-0 mx-auto lg:mx-0">
							{displayMode.isMobile && (
								<div className={`w-full ${profileWidthClass} mx-auto mb-6`}>
									<Profile compact={true} />
								</div>
							)}
							<main className="w-full">
								<Card hoverEffect={false}>
									<article className="prose prose-invert max-w-none text-green-100 dos-article-content">
										<h1 className="text-2xl font-bold mb-2 dos-title">
											双击进入朋友们的站点
										</h1>
										<div className="mb-4 flex items-center gap-2">
											<button
												className="dos-btn"
												onClick={() => {
													// 彻底重置 vis-network
													if (networkRef.current) {
														networkRef.current.destroy();
														networkRef.current = null;
													}
													if (nodesRef.current) {
														nodesRef.current.clear();
														nodesRef.current = null;
													}
													if (edgesRef.current) {
														edgesRef.current.clear();
														edgesRef.current = null;
													}
													setGraph(null); // 触发 useEffect 重新 fetch 并初始化
													setSelectedNodeUrl(null);
													setDraft(null);
													setIncoming([]);
													setOutgoing([]);
													setIncomingCollapsed(true);
													setOutgoingCollapsed(true);
													setLoading(true);
												}}
											>
												刷新数据
											</button>
											<button className="dos-btn" onClick={exportJSON}>
												导出 JSON
											</button>
										</div>
										<div ref={containerRef} style={graphAreaStyle} />
										<div style={editorStyle}>
											{selectedNodeUrl ? (
												<div>
													<h3>
														编辑：{draft?.title || selectedNodeUrl}
														<button
															className="dos-btn danger"
															style={{ marginLeft: 12 }}
															onClick={() => deleteNode(selectedNodeUrl)}
														>
															删除节点
														</button>
													</h3>
													<div style={{ display: "flex", gap: 12 }}>
														<div style={{ flex: 1 }}>
															<div>
																<label>Title / 名称</label>
																<input
																	className="dos-input"
																	style={{ width: "100%" }}
																	value={draft?.title || ""}
																	onChange={(e) =>
																		setDraft({
																			...draft,
																			title: e.target.value,
																		})
																	}
																/>
															</div>
															<div>
																<label>URL</label>
																<input
																	className="dos-input"
																	style={{ width: "100%" }}
																	value={draft?.url || ""}
																	onChange={(e) =>
																		setDraft({ ...draft, url: e.target.value })
																	}
																/>
															</div>
														</div>
													</div>
													<div style={{ flex: 1 }}>
														<h4>站点链接到（outgoing）</h4>
														{outgoingCollapsed ? (
															<div>
																共 {outgoing.length} 个
																{outgoing.length > 0 && (
																	<button
																		className="dos-btn"
																		style={{ marginLeft: 8 }}
																		onClick={() => setOutgoingCollapsed(false)}
																	>
																		展开
																	</button>
																)}
															</div>
														) : (
															<div>
																<ul>
																	{outgoing.map((id) => (
																		<li key={id}>
																			{id}{" "}
																			<button
																				className="dos-btn danger"
																				style={{ marginLeft: 8 }}
																				onClick={() => removeOutgoing(id)}
																			>
																				删除
																			</button>
																		</li>
																	))}
																</ul>
																<button
																	className="dos-btn"
																	style={{ marginTop: 4 }}
																	onClick={() => setOutgoingCollapsed(true)}
																>
																	折叠
																</button>
															</div>
														)}
														<div style={{ marginTop: 8 }}>
															<input
																id="newOutgoing"
																className="dos-input"
																style={{ width: "100%" }}
																placeholder="输入目标节点URL并回车添加"
																onKeyDown={(e) => {
																	if (e.key === "Enter") {
																		const val = e.target.value.trim();
																		if (val) {
																			addOutgoing(val);
																			e.target.value = "";
																		} else {
																			applyDraft();
																		}
																	}
																}}
															/>
														</div>
													</div>
													<div style={{ display: "flex", gap: 24 }}>
														<div style={{ flex: 1 }}>
															<h4>此站点链接（incoming）</h4>
															{incomingCollapsed ? (
																<div>
																	共 {incoming.length} 个
																	{incoming.length > 0 && (
																		<button
																			className="dos-btn"
																			style={{ marginLeft: 8 }}
																			onClick={() =>
																				setIncomingCollapsed(false)
																			}
																		>
																			展开
																		</button>
																	)}
																</div>
															) : (
																<div>
																	<ul>
																		{incoming.map((id) => (
																			<li key={id}>
																				{id}
																				<button
																					className="dos-btn danger"
																					style={{ marginLeft: 8 }}
																					onClick={() => removeIncoming(id)}
																				>
																					删除
																				</button>
																			</li>
																		))}
																	</ul>
																	<button
																		className="dos-btn"
																		style={{ marginTop: 4 }}
																		onClick={() => setIncomingCollapsed(true)}
																	>
																		折叠
																	</button>
																</div>
															)}
														</div>
													</div>
													<div style={{ marginTop: 12 }}>
														<button
															className="dos-btn"
															onClick={() => applyDraft()}
														>
															确认 (Enter)
														</button>
														<button
															className="dos-btn"
															style={{ marginLeft: 8 }}
															onClick={cancelEdit}
														>
															取消 (Esc)
														</button>
													</div>
												</div>
											) : (
												<div>点击图中节点以展开编辑区。</div>
											)}
										</div>
									</article>
								</Card>
							</main>
						</div>
						<aside className="hidden lg:block w-40 flex-shrink-0"></aside>
					</div>
				</div>
			</div>
		</div>
	);
	function removeIncoming(fromUrl) {
		const edges = graph.edges.filter(
			(e) => !(e.from === fromUrl && e.to === selectedNodeUrl)
		);
		setGraph({ ...graph, edges });
		setIncoming(incoming.filter((x) => x !== fromUrl));
	}
	function removeOutgoing(targetUrl) {
		const edges = graph.edges.filter(
			(e) => !(e.from === selectedNodeUrl && e.to === targetUrl)
		);
		setGraph({ ...graph, edges });
		setOutgoing(outgoing.filter((x) => x !== targetUrl));
	}
	function deleteNode(nodeUrl) {
		if (!window.confirm("确定要删除该节点及其所有相关边吗？")) return;
		// 过滤掉被删除节点
		let nodes = graph.nodes.filter((n) => n.url !== nodeUrl);
		// 移除所有节点的 outgoing/incoming 中对该节点的引用
		nodes = nodes.map((n) => ({
			...n,
			outgoing: n.outgoing
				? n.outgoing.filter((url) => url !== nodeUrl)
				: n.outgoing,
			incoming: n.incoming
				? n.incoming.filter((url) => url !== nodeUrl)
				: n.incoming,
		}));
		const edges = graph.edges.filter(
			(e) => e.from !== nodeUrl && e.to !== nodeUrl
		);
		const newGraph = { nodes, edges };
		setGraph(newGraph);
		setSelectedNodeUrl(null);
		setDraft(null);
		setIncomingCollapsed(true);
		setOutgoingCollapsed(true);
		// 同步保存到后端
		fetch("/api/save-friends-graph", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(newGraph),
		});
	}
	function cancelEdit() {
		setSelectedNodeUrl(null);
		setDraft(null);
	}
	function applyDraft(closeAfterSave = false, nextDraft = null) {
		const d = nextDraft || draft;
		console.log("[applyDraft] called", {
			closeAfterSave,
			draft,
			nextDraft,
			used: d,
		});
		if (!d) return;
		// 用 url 作为唯一键
		const nodes = graph.nodes.map((n) =>
			n.url === d.url ? { ...n, ...d } : n
		);
		const newGraph = { ...graph, nodes };
		setGraph(newGraph);
		// 只在需要时关闭编辑区
		if (closeAfterSave) {
			setSelectedNodeUrl(null);
			setDraft(null);
		}
		// 实时保存到后端
		console.log("[applyDraft] fetch /api/save-friends-graph", newGraph);
		fetch("/api/save-friends-graph", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(newGraph),
		});
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
	function addOutgoing(targetUrl) {
		if (!graph || !selectedNodeUrl) return;
		// 边已存在则不做任何事
		if (
			graph.edges.some((e) => e.from === selectedNodeUrl && e.to === targetUrl)
		)
			return;
		// 检查目标节点是否存在
		let nodes = graph.nodes;
		let newNode = null;
		if (!nodes.some((n) => n.url === targetUrl)) {
			// 自动补一个新节点，title 自动编号
			const newTitle = getNextFriendTitle(nodes);
			newNode = { title: newTitle, url: targetUrl };
			nodes = [...nodes, newNode];
		}
		const edges = [
			...graph.edges,
			{ from: selectedNodeUrl, to: targetUrl, label: "" },
		];
		const newGraph = { ...graph, nodes, edges };
		setGraph(newGraph);
		setOutgoing([...outgoing, targetUrl]);
		if (newNode) {
			setSelectedNodeUrl(newNode.url);
			setDraft({ ...newNode });
		}
		// 增量渲染新节点
		if (newNode && nodesRef.current) {
			console.log("[addOutgoing] add new node to vis-network", newNode);
			nodesRef.current.add({
				id: newNode.url,
				label: newNode.title,
				title: newNode.title || newNode.url,
				shape: "box",
				shapeProperties: { borderRadius: 12 },
				margin: 10,
				font: { size: 14 },
				color: { background: "#c0e0d0", border: "#888" },
			});
			if (networkRef.current) {
				networkRef.current.stabilize();
			}
		}
		// 同步保存到后端
		fetch("/api/save-friends-graph", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(newGraph),
		});
	}

	if (loading) return <div style={{ padding: 16 }}>Loading...</div>;
	// ...只保留新版 Card/prose 结构的 return（已在前面定义）...
}
