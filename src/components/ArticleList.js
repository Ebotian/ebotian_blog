import Card from "./Card";
import Link from "next/link";
import React from "react"; // 引入 React 以使用 Fragment

// 辅助函数：将 YYYY-MM 格式化为 "YYYY年 M月" (保持不变)
const formatMonthYear = (monthYearStr) => {
	if (!monthYearStr || monthYearStr.length !== 7) return "";
	const [year, month] = monthYearStr.split("-");
	return `${year}年 ${parseInt(month, 10)}月`;
};

export default function ArticleList({ posts }) {
	if (!posts || posts.length === 0) {
		return <div className="text-center text-gray-400 mt-8">暂无文章</div>;
	}

	let currentMonthYear = null; // 用于跟踪当前显示的月份年份

	return (
		<div className="flex flex-col gap-6">
			{posts.map((post) => {
				let separator = null;
				let postMonthYear = null;

				if (
					post.date &&
					typeof post.date === "string" &&
					post.date.length >= 7
				) {
					postMonthYear = post.date.substring(0, 7);
				}

				if (postMonthYear && postMonthYear !== currentMonthYear) {
					separator = (
						// *** 添加 id 属性 ***
						<h2
							id={`month-${postMonthYear}`} // ID 格式: month-YYYY-MM
							className="text-2xl font-semibold text-blue-300 pt-6 pb-2 mt-4 border-t border-blue-400/50 scroll-mt-16" // scroll-mt-16 添加顶部偏移，防止标题被固定导航栏遮挡
						>
							{formatMonthYear(postMonthYear)}
						</h2>
					);
					currentMonthYear = postMonthYear;
				}

				return (
					<React.Fragment key={post.slug}>
						{separator}
						<Link href={`/${post.slug}`}>
							<Card>
								<div className="flex flex-col md:flex-row md:items-center justify-between">
									<div>
										<h2 className="text-xl font-bold mb-1 dos-title">
											{post.title}
										</h2>
										<p className="text-sm text-green-300 mb-2">{post.date}</p>
										<p className="text-base text-green-200 line-clamp-2">
											{post.excerpt}
										</p>
									</div>
								</div>
							</Card>
						</Link>
					</React.Fragment>
				);
			})}
		</div>
	);
}
