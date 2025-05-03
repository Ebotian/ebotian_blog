import { useState } from "react";
import ArticleList from "../components/ArticleList";
import SearchBar from "../components/SearchBar";
import Profile from "../components/Profile";
import Footer from "../components/Footer";
import { getAllPostsMeta } from "../lib/posts";

export async function getStaticProps() {
	const posts = await getAllPostsMeta();
	return {
		props: {
			posts,
		},
	};
}

export default function Home({ posts }) {
	const [searchResults, setSearchResults] = useState(posts);

	const handleSearch = (results) => {
		setSearchResults(results);
	};

	return (
		<div className="relative min-h-screen bg-black text-green-400 font-mono flex flex-col items-center pt-8 pb-20 px-2 sm:px-8">
			{/* 固定个人介绍 */}
			<div className="fixed top-4 left-4 z-20 hidden md:block">
				<Profile />
			</div>
			{/* 搜索栏 */}
			<div className="w-full max-w-2xl mb-6">
				<SearchBar posts={posts} onSearch={handleSearch} />
			</div>
			{/* 文章列表（卡片式） */}
			<main className="w-full max-w-2xl flex-1">
				<ArticleList posts={searchResults} />
			</main>
			{/* 页脚版权说明 */}
			<footer className="w-full mt-12">
				<Footer />
			</footer>
		</div>
	);
}
