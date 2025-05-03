import { useState, useEffect } from "react";
import ArticleList from "../components/ArticleList";
import SearchBar from "../components/SearchBar";
import Profile from "../components/Profile";
import Footer from "../components/Footer";
import { getAllPostsMeta } from "../lib/posts";
import TimelineNav from "../components/TimelineNav"; // *** 引入 TimelineNav ***

export async function getStaticProps() {
	const posts = await getAllPostsMeta();
	// *** 确保文章按日期降序排序，以便月份分组正确 ***
	posts.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
	return {
		props: {
			posts,
		},
	};
}

export default function Home({ posts }) {
	const [searchResults, setSearchResults] = useState(posts);
	const [displayMode, setDisplayMode] = useState({
		isMobile: false,
		useCompactProfile: false,
	});

	useEffect(() => {
		function handleResize() {
			const width = window.innerWidth;
			const height = window.innerHeight;
			const isMobileView = width < 768;
			const needsCompact = !isMobileView && (width < 1024 || height < 650);
			setDisplayMode({
				isMobile: isMobileView,
				useCompactProfile: needsCompact,
			});
		}
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const handleSearch = (results) => {
		// *** 搜索后也要排序 ***
		results.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
		setSearchResults(results);
	};

	const desktopLeftPadding = displayMode.useCompactProfile
		? "md:pl-56"
		: "md:pl-64";

	// *** 提取唯一的月份 (YYYY-MM) ***
	const uniqueMonths = Array.from(
		new Set(
			searchResults
				.map((post) =>
					post.date && typeof post.date === "string" && post.date.length >= 7
						? post.date.substring(0, 7)
						: null
				)
				.filter((month) => month !== null) // 过滤掉无效日期产生的 null
		)
	);
	// uniqueMonths 现在是 ['2025-05', '2025-01', ...] (顺序取决于原始数据，但通常已排序)

	return (
		<div className="relative min-h-screen bg-black text-green-400 font-mono">
			{/* 桌面端 Profile */}
			{!displayMode.isMobile && (
				<div
					className={`fixed left-4 top-1/2 -translate-y-1/2 z-20 ${
						displayMode.useCompactProfile ? "w-48" : "w-56"
					}`}
				>
					<Profile compact={displayMode.useCompactProfile} />
				</div>
			)}

			{/* 主内容区域 */}
			<div
				className={`flex flex-col items-center pt-8 pb-20 px-4 sm:px-8 ${
					!displayMode.isMobile ? desktopLeftPadding : ""
				}`}
			>
				{/* 移动端 Profile */}
				{displayMode.isMobile && (
					<div className="w-full max-w-2xl mb-6">
						<Profile compact={true} />
					</div>
				)}

				{/* 搜索栏 */}
				<div className="w-full max-w-2xl mb-6">
					<SearchBar posts={posts} onSearch={handleSearch} />
				</div>

				{/* *** 主要内容布局调整：使用 Flexbox 包裹列表和时间轴 *** */}
				<div className="w-full max-w-4xl flex justify-center">
					{" "}
					{/* 稍微加宽容器以容纳时间轴 */}
					{/* 文章列表 */}
					<main className="w-full max-w-2xl flex-1">
						{" "}
						{/* 限制列表最大宽度 */}
						<ArticleList posts={searchResults} />
					</main>
					{/* 时间轴导航 (仅大屏幕显示) */}
					<TimelineNav months={uniqueMonths} />
				</div>

				{/* 页脚 */}
				<footer className="w-full max-w-2xl mt-12 mx-auto">
					{" "}
					{/* 确保页脚也居中 */}
					<Footer />
				</footer>
			</div>
		</div>
	);
}
