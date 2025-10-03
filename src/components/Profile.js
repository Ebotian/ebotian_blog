import React, { useEffect, useState } from "react";
import AsciiCard from "./AsciiCard";

function formatCount(count) {
	if (count === undefined || count === null) return "0";
	if (count < 1000) {
		return count.toLocaleString();
	}
	return (count / 1000).toFixed(1) + "k";
}

export default function Profile({ compact = false, totalWordCount }) {
	const LIGHT_BG = "#FBF3D9"; // soft cream / pale yellow
	const DARK_BG = "#000000"; // black (matches current site background)

	const [isLight, setIsLight] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const saved = window.localStorage.getItem("ebotian_bg_mode");
		const initial = saved === "light" ? "light" : "dark";
		document.documentElement.setAttribute("data-theme", initial);
		setIsLight(initial === "light");
		// Ensure a transition on theme change for background
		document.documentElement.style.transition = "background-color 220ms ease";
	}, []);

	function applyThemeAttribute(mode) {
		// Set data-theme on <html> so CSS variables handle the rest
		if (typeof document !== "undefined") {
			document.documentElement.setAttribute("data-theme", mode);
		}
	}

	function toggleTheme() {
		const next = !isLight;
		setIsLight(next);
		const mode = next ? "light" : "dark";
		applyThemeAttribute(mode);
		window.localStorage.setItem("ebotian_bg_mode", mode);
	}

	return (
		<div
			className={`flex flex-col items-center border-2 border-blue-400 rounded-xl dos-card-profile ${
				compact ? "w-full p-3" : "w-56 p-4"
			}`}
		>
			<img
				src="/avatar.jpg"
				alt="avatar"
				className={`${
					compact ? "w-16 h-16 mb-3" : "w-28 h-28 mb-2"
				} rounded-full border-4 border-blue-300`}
				draggable="false"
			/>
			<div className="flex flex-col items-center w-full">
				<h2 className="text-lg font-bold mt-1 mb-1 text-center">Ebit</h2>
				<p className="text-sm mb-2 text-center">求工作...</p>
				<div className="flex justify-center space-x-3 mt-auto pt-2">
					<a
						href="mailto:yiboxiaotian@nuaa.edu.cn"
						title="邮箱"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-opacity-80 transition-colors"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="w-6 h-6"
						>
							<rect width="20" height="16" x="2" y="4" rx="2" />
							<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
						</svg>
					</a>
					<a
						href="https://github.com/Ebotian"
						title="GitHub"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-opacity-80 transition-colors"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							className="w-6 h-6"
							fill="currentColor"
						>
							<path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.202 2.397.1 2.65.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
						</svg>
					</a>
					<a
						href="https://x.com/asilena123"
						title="X(Twitter)"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-opacity-80 transition-colors"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							className="w-6 h-6"
							fill="currentColor"
						>
							<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
						</svg>
					</a>
				</div>
				{/* 总字数显示在底部 */}
				{typeof totalWordCount === "number" && (
					<p
						className="text-xs mt-3 text-center"
						style={{ color: "var(--card-text)" }}
					>
						全部文章总字数：{formatCount(totalWordCount)}
					</p>
				)}
				{/* 加入 ASCII 艺术卡片 */}
				<AsciiCard />
			</div>
			{/* Theme toggle button: matches link style but prominent */}
			<div className="flex justify-center mt-3">
				<button
					onClick={toggleTheme}
					aria-pressed={isLight}
					title={isLight ? "切换到深色背景" : "切换到米白背景"}
					className="flex items-center space-x-2 px-3 py-1 rounded-full border-2 border-blue-400 hover:bg-opacity-30 transition-colors"
					style={{ backgroundColor: "rgba(0,0,0,0.08)" }}
				>
					{/* Icon: sun for light, moon for dark */}
					{isLight ? (
						<svg
							className="w-5 h-5"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M12 4.5V3"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<path
								d="M12 21v-1.5"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<path
								d="M4.5 12H3"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<path
								d="M21 12h-1.5"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<path
								d="M5.636 5.636L4.222 4.222"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<path
								d="M19.778 19.778L18.364 18.364"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<path
								d="M19.778 4.222L18.364 5.636"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<path
								d="M5.636 18.364L4.222 19.778"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<circle
								cx="12"
								cy="12"
								r="3"
								stroke="currentColor"
								strokeWidth="1.5"
							/>
						</svg>
					) : (
						<svg
							className="w-5 h-5"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					)}
					<span className="text-xs">{isLight ? "亮主题" : "暗主题"}</span>
				</button>
			</div>
		</div>
	);
}
