import { useState } from "react";
import Fuse from "fuse.js";

export default function SearchBar({ posts, onSearch }) {
	const [query, setQuery] = useState("");

	// 配置 fuse.js 关键词模糊搜索
	const fuse = new Fuse(posts, {
		keys: ["title", "excerpt", "date"],
		threshold: 0.3,
	});

	const handleChange = (e) => {
		const value = e.target.value;
		setQuery(value);
		if (!value) {
			onSearch(posts);
			return;
		}
		const results = fuse.search(value).map((r) => r.item);
		onSearch(results);
	};

	return (
		<div className="mb-4">
			<input
				type="text"
				className="w-full px-4 py-2 rounded border-2 border-green-400 bg-black text-green-200 focus:outline-none focus:ring-2 focus:ring-green-300 dos-input"
				placeholder="搜索文章关键词..."
				value={query}
				onChange={handleChange}
				autoComplete="off"
			/>
		</div>
	);
}
