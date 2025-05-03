// filepath: /home/ebit/ebotian_blog/src/components/UtterancesComments.js
import React, { useEffect, useRef } from "react";

const UtterancesComments = () => {
	const commentsContainerRef = useRef(null);

	useEffect(() => {
		const container = commentsContainerRef.current;
		if (!container) return; // 确保容器存在

		// 清理旧的评论容器（如果存在）
		// 移除所有子节点，防止重复加载或脚本冲突
		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}

		// 创建 utterances script
		const script = document.createElement("script");
		script.src = "https://utteranc.es/client.js";
		script.async = true;
		script.setAttribute("repo", "Ebotian/ebotian_blog"); // 替换为你的 GitHub 仓库
		script.setAttribute("issue-term", "pathname"); // 使用 pathname 映射 issue
		script.setAttribute("label", "💬 utterances"); // 可选标签
		script.setAttribute("theme", "github-dark"); // 主题
		script.crossOrigin = "anonymous";

		// 将脚本添加到 ref 指向的 div 中
		// 使用 setTimeout 稍微延迟脚本添加，有时可以避免与路由转换冲突
		const timeoutId = setTimeout(() => {
			if (container) {
				// 再次检查容器是否存在
				container.appendChild(script);
			}
		}, 100); // 延迟 100ms

		// 清理函数：组件卸载时移除容器内容
		return () => {
			clearTimeout(timeoutId); // 清除定时器
			// 再次清理容器，确保卸载时干净
			while (container && container.firstChild) {
				container.removeChild(container.firstChild);
			}
		};
	}, []); // 空依赖数组，表示只在组件挂载和卸载时运行

	return <div ref={commentsContainerRef} className="utterances-container" />;
};

export default UtterancesComments;
