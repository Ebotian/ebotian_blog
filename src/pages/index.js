import { useState, useEffect } from "react";
import ArticleList from "../components/ArticleList";
import SearchBar from "../components/SearchBar";
import Profile from "../components/Profile";
import Footer from "../components/Footer";
import { getAllPostsMeta } from "../lib/posts";
import TimelineNav from "../components/TimelineNav";

export async function getStaticProps() {
	const posts = await getAllPostsMeta();
	// Ensure posts are sorted descending by date
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
		isLargeScreen: false, // State to track if screen is lg+
	});

	useEffect(() => {
		function handleResize() {
			const width = window.innerWidth;
			const height = window.innerHeight;
			const isMobileView = width < 768;
			const isLargeView = width >= 1024; // lg breakpoint
			// Compact profile needed if not mobile AND (screen is small OR height is limited)
			// On large screens, always use non-compact unless height is very limited
			const needsCompact =
				!isMobileView && ((!isLargeView && width < 1024) || height < 650);
			setDisplayMode({
				isMobile: isMobileView,
				useCompactProfile: needsCompact,
				isLargeScreen: isLargeView, // Update lg state
			});
		}
		handleResize(); // Initial check
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const handleSearch = (results) => {
		// Ensure search results are also sorted
		results.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
		setSearchResults(results);
	};

	// Extract unique months for TimelineNav
	const uniqueMonths = Array.from(
		new Set(
			searchResults
				.map((post) =>
					post.date && typeof post.date === "string" && post.date.length >= 7
						? post.date.substring(0, 7)
						: null
				)
				.filter((month) => month !== null)
		)
	);

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
				{/* Use a wider container to accommodate 3 columns on LG+ */}
				{/* Use justify-center to center the block of columns */}
				<div className="max-w-7xl mx-auto">
					{/* Flex row layout for LG+ screens */}
					<div className="lg:flex lg:justify-center lg:gap-8">
						{/* Left Column: Profile (LG+ only, sticky) */}
						<aside
							className={`hidden lg:block ${profileWidthClass} flex-shrink-0`}
						>
							{/* Sticky container for Profile */}
							<div className="sticky top-20 h-fit">
								{" "}
								{/* Ensure sticky container has defined height context */}
								<Profile compact={displayMode.useCompactProfile} />
							</div>
						</aside>

						{/* Center Column: Main Content (Search, List, Footer) */}
						{/* Constrained width, allows shrinking */}
						<div className="w-full max-w-2xl flex-shrink min-w-0 mx-auto lg:mx-0">
							{" "}
							{/* Center on mobile/tablet, align left in flex on lg */}
							{/* Mobile Profile (Top) */}
							{displayMode.isMobile && (
								<div className={`w-full ${profileWidthClass} mx-auto mb-6`}>
									{" "}
									{/* Center mobile profile */}
									<Profile compact={true} />
								</div>
							)}
							{/* Search Bar */}
							{/* w-full ensures it takes the max-w-2xl from parent */}
							<div className="w-full mb-6">
								<SearchBar posts={posts} onSearch={handleSearch} />
							</div>
							{/* Article List */}
							{/* w-full ensures it takes the max-w-2xl from parent */}
							<main className="w-full">
								<ArticleList posts={searchResults} />
							</main>
							{/* Footer */}
							{/* w-full ensures it takes the max-w-2xl from parent */}
							<footer className="w-full mt-12">
								<Footer />
							</footer>
						</div>

						{/* Right Column: Timeline (LG+ only, sticky) */}
						{/* TimelineNav component handles its own width and sticky positioning */}
						<aside className="hidden lg:block flex-shrink-0">
							{/* TimelineNav includes sticky positioning internally */}
							<TimelineNav months={uniqueMonths} />
						</aside>
					</div>
				</div>
			</div>
		</div>
	);
}
