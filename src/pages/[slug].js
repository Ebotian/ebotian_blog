import { getAllPostsMeta, getPostBySlug } from "../lib/posts";
import { markdownToHtml } from "../lib/markdown";
import ArticleContent from "../components/ArticleContent";
import Profile from "../components/Profile";
import Footer from "../components/Footer";
import SearchBar from "../components/SearchBar";
import { useEffect, useRef } from "react";

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
	const allPosts = getAllPostsMeta();
	return {
		props: {
			post: { ...post, contentHtml },
			allPosts,
		},
	};
}

export default function PostPage({ post, allPosts }) {
	const utterancesRef = useRef(null);

	useEffect(() => {
		// 创建一个新的评论容器元素来替换旧容器
		const commentsContainer = document.createElement("div");

		// 如果已有容器，替换它
		if (utterancesRef.current) {
			if (utterancesRef.current.firstChild) {
				utterancesRef.current.removeChild(utterancesRef.current.firstChild);
			}
			utterancesRef.current.appendChild(commentsContainer);
		}

		// 创建 utterances script
		const script = document.createElement("script");
		script.src = "https://utteranc.es/client.js";
		script.async = true;
		script.setAttribute("repo", "Ebotian/ebotian_blog");
		script.setAttribute("issue-term", "pathname");
		script.setAttribute("label", "💬 utterances");
		script.setAttribute("theme", "github-dark");
		script.crossOrigin = "anonymous";

		// 将脚本添加到新创建的容器中
		commentsContainer.appendChild(script);

		// 清理函数
		return () => {
			if (
				utterancesRef.current &&
				commentsContainer.parentElement === utterancesRef.current
			) {
				utterancesRef.current.removeChild(commentsContainer);
			}
		};
	}, [post.slug]);

	return (
		<div className="relative min-h-screen bg-black text-green-400 font-mono flex flex-col items-center pt-8 pb-20 px-2 sm:px-8">
			{/* 固定个人介绍 */}
			<div className="fixed top-4 left-4 z-20 hidden md:block">
				<Profile />
			</div>
			{/* 搜索栏 */}
			<div className="w-full max-w-2xl mb-6">
				<SearchBar posts={allPosts} onSearch={() => {}} />
			</div>
			{/* 文章内容 */}
			<main className="w-full max-w-2xl flex-1">
				<ArticleContent
					title={post.title}
					date={post.date}
					contentHtml={post.contentHtml}
				/>
				<div ref={utterancesRef} className="mt-8" />
			</main>
			{/* 页脚版权说明 */}
			<footer className="w-full mt-12">
				<Footer />
			</footer>
		</div>
	);
}
