import { useState, useEffect } from "react";
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
	// State to manage display mode based on screen size
	const [displayMode, setDisplayMode] = useState({
		isMobile: false,
		useCompactProfile: false,
	});

	useEffect(() => {
		function handleResize() {
			const width = window.innerWidth;
			const height = window.innerHeight;

			// Determine if it's a mobile view (Tailwind's md breakpoint)
			const isMobileView = width < 768;

			// Determine if the fixed profile should be compact
			// Use compact if width is between md and lg, or if height is limited on desktop
			const needsCompact = !isMobileView && (width < 1024 || height < 650);

			setDisplayMode({
				isMobile: isMobileView,
				useCompactProfile: needsCompact,
			});
		}

		// Initial check on mount
		handleResize();

		// Add resize listener
		window.addEventListener("resize", handleResize);

		// Cleanup listener on unmount
		return () => window.removeEventListener("resize", handleResize);
	}, []); // Empty dependency array ensures this runs only on mount and unmount

	const handleSearch = (results) => {
		setSearchResults(results);
	};

	// Define left padding for main content based on display mode for desktop
	const desktopLeftPadding = displayMode.useCompactProfile
		? "md:pl-56"
		: "md:pl-64"; // Adjust pl values based on Profile width + desired gap

	return (
		// Use relative positioning for the main container
		<div className="relative min-h-screen bg-black text-green-400 font-mono">
			{/* Fixed Profile for Desktop */}
			{/* Render only if not mobile view */}
			{!displayMode.isMobile && (
				<div
					className={`fixed top-4 left-4 z-20 ${
						displayMode.useCompactProfile ? "w-48" : "w-56"
					}`}
				>
					{" "}
					{/* Adjust width if needed */}
					<Profile compact={displayMode.useCompactProfile} />
				</div>
			)}

			{/* Main Content Area */}
			{/* Apply dynamic padding-left on desktop to avoid overlap */}
			<div
				className={`flex flex-col items-center pt-8 pb-20 px-4 sm:px-8 ${
					!displayMode.isMobile ? desktopLeftPadding : ""
				}`}
			>
				{/* Mobile Profile */}
				{/* Render only if mobile view */}
				{displayMode.isMobile && (
					<div className="w-full max-w-2xl mb-6">
						<Profile compact={true} />
					</div>
				)}

				{/* Search Bar */}
				<div className="w-full max-w-2xl mb-6">
					<SearchBar posts={posts} onSearch={handleSearch} />
				</div>

				{/* Article List */}
				<main className="w-full max-w-2xl flex-1">
					<ArticleList posts={searchResults} />
				</main>

				{/* Footer */}
				<footer className="w-full max-w-2xl mt-12">
					<Footer />
				</footer>
			</div>
		</div>
	);
}
