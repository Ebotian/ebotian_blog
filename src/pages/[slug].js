import { getAllPostsMeta, getPostBySlug } from "../lib/posts";
import { markdownToHtml } from "../lib/markdown";
import ArticleContent from "../components/ArticleContent";
import Profile from "../components/Profile";
import Footer from "../components/Footer";
import SearchBar from "../components/SearchBar";
import { useEffect, useState } from "react"; // 移除了 useRef
import UtterancesComments from "../components/UtterancesComments"; // 引入新组件

export async function getStaticPaths() {
	const posts = await getAllPostsMeta();
	return {
		paths: posts.map((post) => ({ params: { slug: post.slug } })),
		fallback: false,
	};
}

export async function getStaticProps({ params }) {
	const post = getPostBySlug(params.slug);
	// 确保在 getPostBySlug 之后再处理 markdown
	const contentHtml = await markdownToHtml(post.content || "");
	const allPosts = getAllPostsMeta(); // 获取所有文章元数据用于搜索
	return {
		props: {
			post: { ...post, contentHtml }, // 将 HTML 内容合并到 post 对象中
			allPosts, // 传递所有文章数据给页面
		},
	};
}

export default function PostPage({ post, allPosts }) {
	// --- 开始：与 index.js 一致的响应式逻辑 ---
	const [displayMode, setDisplayMode] = useState({
		isMobile: false,
		useCompactProfile: false,
	});

	useEffect(() => {
		function handleResize() {
			const width = window.innerWidth;
			const height = window.innerHeight;
			const isMobileView = width < 768;
			// 调整紧凑模式的判断逻辑，与 index.js 保持一致
			const needsCompact = !isMobileView && (width < 1024 || height < 650);
			setDisplayMode({
				isMobile: isMobileView,
				useCompactProfile: needsCompact,
			});
		}
		handleResize(); // 初始检查
		window.addEventListener("resize", handleResize); // 添加监听
		return () => window.removeEventListener("resize", handleResize); // 清理监听
	}, []);

	// 根据桌面端的显示模式定义主内容的左内边距
	const desktopLeftPadding = displayMode.useCompactProfile
		? "md:pl-56" // 紧凑模式下的左内边距
		: "md:pl-64"; // 常规模式下的左内边距
	// --- 结束：响应式逻辑 ---

	// Utterances 逻辑已移至 UtterancesComments 组件

	return (
		// 使用相对定位作为主容器
		<div className="relative min-h-screen bg-black text-green-400 font-mono">
			{/* 桌面端固定的个人资料卡片 */}
			{/* 仅在非移动视图下渲染 */}
			{!displayMode.isMobile && (
				<div
					// 使用 fixed 定位，左侧固定，垂直居中
					className={`fixed left-4 top-1/2 -translate-y-1/2 z-20 ${
						displayMode.useCompactProfile ? "w-48" : "w-56" // 根据模式调整宽度
					}`}
				>
					{/* 传递 compact 状态 */}
					<Profile compact={displayMode.useCompactProfile} />
				</div>
			)}

			{/* 主内容区域 */}
			{/* 在桌面端应用动态的左内边距以避免重叠 */}
			<div
				className={`flex flex-col items-center pt-8 pb-20 px-4 sm:px-8 ${
					!displayMode.isMobile ? desktopLeftPadding : "" // 仅在非移动视图应用左内边距
				}`}
			>
				{/* 移动端个人资料卡片 */}
				{/* 仅在移动视图下渲染 */}
				{displayMode.isMobile && (
					<div className="w-full max-w-2xl mb-6">
						{/* 移动端始终使用紧凑模式 */}
						<Profile compact={true} />
					</div>
				)}

				{/* 搜索栏 - 保持与 index.js 一致 */}
				<div className="w-full max-w-2xl mb-6">
					{/* 传递 allPosts 用于搜索 */}
					{/* onSearch 可以留空或实现页面跳转逻辑 */}
					<SearchBar posts={allPosts} onSearch={() => {}} />
				</div>

				{/* 文章内容和评论区 */}
				<main className="w-full max-w-2xl flex-1">
					<ArticleContent
						title={post.title}
						date={post.date}
						contentHtml={post.contentHtml}
					/>
					{/* 使用 UtterancesComments 组件 */}
					<div className="mt-12">
						{/* 使用 key={post.slug} 强制重新挂载组件 */}
						{/* 这确保了每次页面切换时，Utterances 组件 */}
						{/* 都会经历完整的卸载和挂载过程，从而正确加载评论 */}
						<UtterancesComments key={post.slug} />
					</div>
				</main>

				{/* 页脚 */}
				<footer className="w-full max-w-2xl mt-12">
					<Footer />
				</footer>
			</div>
		</div>
	);
}
