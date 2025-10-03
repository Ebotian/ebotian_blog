// src/components/UtterancesComments.js
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

// Map your site's data-theme value to an utterances theme name
const mapDataThemeToUtterances = (dataTheme, fallback = "github-dark") => {
	if (!dataTheme) return fallback;
	const t = String(dataTheme).toLowerCase();
	if (t === "light") return "github-light";
	if (t === "dark") return "github-dark";
	// default fallback
	return fallback;
};

const UtterancesComments = ({ theme = "github-dark" }) => {
	const containerRef = useRef(null);
	const router = useRouter();
	const [utterancesTheme, setUtterancesTheme] = useState(theme);

	// Observe <html data-theme=...> changes and update utterancesTheme accordingly
	useEffect(() => {
		if (typeof document === "undefined") return;
		try {
			const current = document.documentElement.getAttribute("data-theme");
			setUtterancesTheme(mapDataThemeToUtterances(current, theme));

			const obs = new MutationObserver((records) => {
				for (const r of records) {
					if (r.type === "attributes" && r.attributeName === "data-theme") {
						const val = document.documentElement.getAttribute("data-theme");
						setUtterancesTheme(mapDataThemeToUtterances(val, theme));
						break;
					}
				}
			});

			obs.observe(document.documentElement, {
				attributes: true,
				attributeFilter: ["data-theme"],
			});
			return () => obs.disconnect();
		} catch (e) {
			// ignore observer errors in very locked-down environments
		}
	}, [theme]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		// 安全清理容器（优先用 modern API，降级到传统方法）
		try {
			if (typeof container.replaceChildren === "function") {
				container.replaceChildren();
			} else {
				while (container.firstChild)
					container.removeChild(container.firstChild);
			}
		} catch (err) {
			console.warn("utterances: failed to clear container", err);
			try {
				container.innerHTML = "";
			} catch (e) {}
		}

		// 创建并插入脚本
		const script = document.createElement("script");
		script.src = "https://utteranc.es/client.js";
		script.async = true;
		script.crossOrigin = "anonymous";
		// 推荐使用简单 ASCII label，避免极端环境出错
		script.setAttribute("repo", "Ebotian/ebotian_blog");
		script.setAttribute("issue-term", "pathname");
		script.setAttribute("label", "utterances");
		// Use the mapped utterances theme (keeps backward compatibility with prop)
		script.setAttribute("theme", utterancesTheme || theme);

		script.onload = () => {
			// 可选：调试用
			// console.log("utterances loaded");
		};
		script.onerror = (e) => {
			console.warn("utterances script failed to load", e);
		};

		// append（有时在 route 切换中，轻微延迟能降低竞态）
		const timeoutId = setTimeout(() => {
			try {
				container.appendChild(script);
			} catch (err) {
				console.warn("utterances: append failed", err);
			}
		}, 50);

		return () => {
			clearTimeout(timeoutId);
			// 尝试删除脚本并清理容器
			try {
				if (script.parentNode) script.parentNode.removeChild(script);
			} catch (e) {}
			try {
				container.innerHTML = "";
			} catch (e) {}
		};
	}, [utterancesTheme, router.asPath]); // 当主题 (data-theme) 或路由变化时重载评论

	return <div ref={containerRef} className="utterances-container" />;
};

export default UtterancesComments;
