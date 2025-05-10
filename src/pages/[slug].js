import { getAllPostsMeta, getPostBySlug } from "../lib/posts";
import { markdownToHtml } from "../lib/markdown";
import ArticleContent from "../components/ArticleContent";
import Profile from "../components/Profile";
import Footer from "../components/Footer";
import SearchBar from "../components/SearchBar";
import { useEffect, useState } from "react";
import UtterancesComments from "../components/UtterancesComments";

export async function getStaticPaths() {
	const posts = await getAllPostsMeta();
	return {
		paths: posts.map((post) => ({ params: { slug: post.slug } })),
		fallback: false,
	};
}

export async function getStaticProps({ params }) {
	const post = getPostBySlug(params.slug);
	const contentHtml = await markdownToHtml(post.content || "");
	// // --- 调试代码开始 ---
	// console.log("--- DEBUG: Generated contentHtml ---");
	// // 为了更容易找到代码块，可以只打印包含 <pre> 或 <code> 的部分
	// // 如果内容很多，可以考虑截取或只在特定文章slug下打印
	// if (contentHtml.includes("<pre") || contentHtml.includes("<code")) {
	// 	console.log(contentHtml);
	// } else {
	// 	console.log("No <pre> or <code> tags found in contentHtml for this post.");
	// }
	// console.log("--- DEBUG: End of contentHtml ---");
	// // --- 调试代码结束 ---
	const allPosts = getAllPostsMeta();
	// 计算所有文章的总字数（以中文字符计）
	const totalWordCount = allPosts.reduce(
		(sum, p) => sum + (p.wordCount || 0),
		0
	);
	return {
		props: {
			post: { ...post, contentHtml },
			allPosts,
			totalWordCount,
		},
	};
}

export default function PostPage({ post, allPosts, totalWordCount }) {
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

	return (
		<div className="relative min-h-screen bg-black text-green-400 font-mono">
			{/* Profile for MD screens ONLY (Tablet/Small Desktop) - Fixed Left */}
			{!displayMode.isMobile && !displayMode.isLargeScreen && (
				<div
					className={`fixed left-4 top-1/2 -translate-y-1/2 z-20 ${profileWidthClass}`}
				>
					<Profile
						compact={displayMode.useCompactProfile}
						totalWordCount={totalWordCount}
					/>
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
								<Profile
									compact={displayMode.useCompactProfile}
									totalWordCount={totalWordCount}
								/>
							</div>
						</aside>
						<div className="w-full max-w-2xl flex-shrink min-w-0 mx-auto lg:mx-0">
							{displayMode.isMobile && (
								<div className={`w-full ${profileWidthClass} mx-auto mb-6`}>
									<Profile compact={true} totalWordCount={totalWordCount} />
								</div>
							)}
							<div className="w-full mb-6">
								<SearchBar posts={allPosts} onSearch={() => {}} />
							</div>
							<main className="w-full">
								<ArticleContent
									title={post.title}
									date={post.date}
									contentHtml={post.contentHtml}
								/>
								<div className="mt-12">
									<UtterancesComments key={post.slug} />
								</div>
							</main>
							<footer className="w-full mt-12">
								<Footer />
							</footer>
						</div>
						<aside className="hidden lg:block w-40 flex-shrink-0"></aside>
					</div>
				</div>
			</div>
		</div>
	);
}
