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
	const allPosts = getAllPostsMeta(); // Get all posts for search
	return {
		props: {
			post: { ...post, contentHtml },
			allPosts,
		},
	};
}

export default function PostPage({ post, allPosts }) {
	// --- Start: Consistent Responsive Logic with index.js ---
	const [displayMode, setDisplayMode] = useState({
		isMobile: false,
		useCompactProfile: false,
		isLargeScreen: false, // State to track if screen is lg+
	});

	useEffect(() => {
		function handleResize() {
			const width = window.innerWidth;
			const height = window.innerHeight;
			const isMobileView = width < 768;
			const isLargeView = width >= 1024; // lg breakpoint
			// Consistent compact mode logic
			const needsCompact =
				!isMobileView && ((!isLargeView && width < 1024) || height < 650);
			setDisplayMode({
				isMobile: isMobileView,
				useCompactProfile: needsCompact,
				isLargeScreen: isLargeView, // Update lg state
			});
		}
		handleResize(); // Initial check
		window.addEventListener("resize", handleResize); // Add listener
		return () => window.removeEventListener("resize", handleResize); // Cleanup listener
	}, []);
	// --- End: Responsive Logic ---

	// Define profile width class based on state
	const profileWidthClass = displayMode.useCompactProfile ? "w-48" : "w-56";

	return (
		<div className="relative min-h-screen bg-black text-green-400 font-mono">
			{/* Profile for MD screens ONLY (Tablet/Small Desktop) - Fixed Left */}
			{/* Shown only between 768px and 1024px */}
			{!displayMode.isMobile && !displayMode.isLargeScreen && (
				<div
					className={`fixed left-4 top-1/2 -translate-y-1/2 z-20 ${profileWidthClass}`}
				>
					<Profile compact={displayMode.useCompactProfile} />
				</div>
			)}

			{/* Main Content Area Wrapper */}
			{/* Add left padding ONLY on MD screens to avoid overlap with the fixed profile */}
			<div
				className={`pt-8 pb-20 px-4 sm:px-8 ${
					!displayMode.isMobile && !displayMode.isLargeScreen // Apply only on MD
						? displayMode.useCompactProfile
							? "md:pl-56"
							: "md:pl-64" // Dynamic padding based on compact mode
						: "" // No padding needed on SM (mobile) or LG+ (large)
				}`}
			>
				{/* Centering container for overall layout */}
				<div className="max-w-7xl mx-auto">
					{/* Flex row layout for LG+ screens */}
					<div className="lg:flex lg:justify-center lg:gap-8">
						{/* Left Column: Profile (LG+ only, sticky) */}
						<aside
							className={`hidden lg:block ${profileWidthClass} flex-shrink-0`}
						>
							{/* Sticky container for Profile */}
							<div className="sticky top-20 h-fit">
								<Profile compact={displayMode.useCompactProfile} />
							</div>
						</aside>

						{/* Center Column: Main Content (Search, Article, Comments, Footer) */}
						<div className="w-full max-w-2xl flex-shrink min-w-0 mx-auto lg:mx-0">
							{/* Mobile Profile (Top) */}
							{displayMode.isMobile && (
								<div className={`w-full ${profileWidthClass} mx-auto mb-6`}>
									<Profile compact={true} />
								</div>
							)}

							{/* Search Bar */}
							<div className="w-full mb-6">
								{/* Pass allPosts for search functionality */}
								<SearchBar
									posts={allPosts}
									onSearch={() => {
										/* Implement search result navigation if needed */
									}}
								/>
							</div>

							{/* Article Content and Comments */}
							<main className="w-full">
								<ArticleContent
									title={post.title}
									date={post.date}
									contentHtml={post.contentHtml}
								/>
								{/* Utterances Comments */}
								<div className="mt-12">
									{/* Key ensures component remounts on page change */}
									<UtterancesComments key={post.slug} />
								</div>
							</main>

							{/* Footer */}
							<footer className="w-full mt-12">
								<Footer />
							</footer>
						</div>

						{/* Right Column: Placeholder (LG+ only) */}
						{/* Add a placeholder to maintain spacing consistent with index.js */}
						{/* Use the same width as TimelineNav (w-40) */}
						<aside className="hidden lg:block w-40 flex-shrink-0">
							{/* This space can be used for Table of Contents or other elements later */}
						</aside>
					</div>
				</div>
			</div>
		</div>
	);
}
