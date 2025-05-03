import React from "react";
import AsciiCard from "./AsciiCard";

function formatCount(count) {
	if (count === undefined || count === null) return "0";
	if (count < 1000) {
		return count.toLocaleString();
	}
	return (count / 1000).toFixed(1) + "k";
}

export default function Profile({ compact = false, totalWordCount }) {
	return (
		<div
			className={`flex flex-col items-center bg-gray-800 bg-opacity-90 border-2 border-blue-400 rounded-xl shadow-xl dos-card-profile ${
				compact ? "w-full p-3" : "w-56 p-4"
			}`}
		>
			<img
				src="/avatar.jpg"
				alt="avatar"
				className={`${
					compact ? "w-16 h-16 mb-3" : "w-28 h-28 mb-2"
				} rounded-full border-4 border-blue-300 shadow-md`}
				draggable="false"
			/>
			<div className="flex flex-col items-center w-full">
				<h2 className="text-lg font-bold text-blue-200 mt-1 mb-1 text-center">
					Ebit
				</h2>
				<p className="text-sm text-blue-100 mb-2 text-center">
					编程爱好者
					{!compact && <br />}
					欢迎交流！
				</p>
				<div className="flex justify-center space-x-3 mt-auto pt-2">
					<a
						href="mailto:yiboxiaotian@nuaa.edu.cn"
						title="邮箱"
						target="_blank"
						rel="noopener noreferrer"
						className="text-blue-100 hover:text-blue-300 transition-colors"
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
						className="text-blue-100 hover:text-blue-300 transition-colors"
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
						className="text-blue-100 hover:text-blue-300 transition-colors"
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
					<p className="text-xs text-blue-200/80 mt-3 text-center">
						全部文章总字数：{formatCount(totalWordCount)}
					</p>
				)}
				{/* 加入 ASCII 艺术卡片 */}
				<AsciiCard />
			</div>
		</div>
	);
}
