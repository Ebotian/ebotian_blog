import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router"; // Import useRouter
import ArticleList from "../components/ArticleList";
import SearchBar from "../components/SearchBar";
import Profile from "../components/Profile";
import Footer from "../components/Footer";
import { getAllPostsMeta } from "../lib/posts";
import TimelineNav from "../components/TimelineNav";

export async function getStaticProps() {
	const posts = await getAllPostsMeta();
	// Calculate total word count here, as it's static data
	const totalWordCount = posts.reduce(
		(sum, post) => sum + (post.wordCount || 0),
		0
	);
	// Sorting is now handled within getAllPostsMeta
	return {
		props: {
			posts,
			totalWordCount, // Pass total count from static props
		},
	};
}

// Receive totalWordCount from getStaticProps
export default function Home({ posts, totalWordCount }) {
	const [searchResults, setSearchResults] = useState(posts);
	const [displayMode, setDisplayMode] = useState({
		isMobile: false,
		useCompactProfile: false,
		isLargeScreen: false,
	});
	const router = useRouter(); // Get router instance
	const scrollPosRef = useRef(0); // Ref to store scroll position before navigating away

	// --- Start: Scroll Restoration Logic ---
	useEffect(() => {
		const handleRouteChangeStart = (url) => {
			// Save scroll position only when navigating away from the home page
			if (router.pathname === "/") {
				scrollPosRef.current = window.scrollY;
				sessionStorage.setItem("home-scroll", scrollPosRef.current.toString());
				// console.log(`Saving scroll for /: ${scrollPosRef.current}`);
			}
		};

		const handleRouteChangeComplete = (url) => {
			// Restore scroll position only when navigating back to the home page
			if (url === "/" && router.pathname === "/") {
				const savedScroll = sessionStorage.getItem("home-scroll");
				if (savedScroll) {
					// Use setTimeout to ensure DOM is ready after navigation
					setTimeout(() => {
						// console.log(`Restoring scroll for /: ${savedScroll}`);
						window.scrollTo(0, parseInt(savedScroll, 10));
					}, 50); // Adjust delay if needed
				}
			}
		};

		// Subscribe to router events
		router.events.on("routeChangeStart", handleRouteChangeStart);
		router.events.on("routeChangeComplete", handleRouteChangeComplete);

		// Restore on initial load if applicable
		const initialSavedScroll = sessionStorage.getItem("home-scroll");
		if (initialSavedScroll && router.pathname === "/") {
			// console.log(`Restoring initial scroll for /: ${initialSavedScroll}`);
			// Use timeout for initial load as well
			setTimeout(() => {
				window.scrollTo(0, parseInt(initialSavedScroll, 10));
			}, 50);
		}

		// Cleanup function to unsubscribe
		return () => {
			router.events.off("routeChangeStart", handleRouteChangeStart);
			router.events.off("routeChangeComplete", handleRouteChangeComplete);
		};
	}, [router.events, router.pathname]); // Depend on router events and pathname
	// --- End: Scroll Restoration Logic ---

	// --- Start: Responsive Logic ---
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
	// --- End: Responsive Logic ---

	const handleSearch = (results) => {
		results.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
		setSearchResults(results);
	};

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

	const profileWidthClass = displayMode.useCompactProfile ? "w-48" : "w-56";

	// Note: totalWordCount is now passed from getStaticProps

	return (
		// No need for mainRef anymore for this scroll logic
		<div className="relative min-h-screen bg-black text-green-400 font-mono">
			{/* Profile for MD screens ONLY */}
			{!displayMode.isMobile && !displayMode.isLargeScreen && (
				<div
					className={`fixed left-4 top-1/2 -translate-y-1/2 z-20 ${profileWidthClass}`}
				>
					<Profile
						compact={displayMode.useCompactProfile}
						totalWordCount={totalWordCount} // Use prop from getStaticProps
					/>
				</div>
			)}

			{/* Main Content Area Wrapper */}
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
						{/* Left Column: Profile (LG+ only, sticky) */}
						<aside
							className={`hidden lg:block ${profileWidthClass} flex-shrink-0`}
						>
							<div className="sticky top-20 h-fit">
								<Profile
									compact={displayMode.useCompactProfile}
									totalWordCount={totalWordCount} // Use prop from getStaticProps
								/>
							</div>
						</aside>

						{/* Center Column: Main Content */}
						<div className="w-full max-w-2xl flex-shrink min-w-0 mx-auto lg:mx-0">
							{/* Mobile Profile (Top) */}
							{displayMode.isMobile && (
								<div className={`w-full ${profileWidthClass} mx-auto mb-6`}>
									<Profile compact={true} totalWordCount={totalWordCount} />
								</div>
							)}
							{/* Search Bar */}
							<div className="w-full mb-6">
								{/* Pass original posts to SearchBar */}
								<SearchBar posts={posts} onSearch={handleSearch} />
							</div>
							{/* Article List */}
							<main className="w-full">
								{/* Display search results */}
								<ArticleList posts={searchResults} />
							</main>
							{/* Footer */}
							<footer className="w-full mt-12">
								<Footer />
							</footer>
						</div>

						{/* Right Column: Timeline */}
						<aside className="hidden lg:block flex-shrink-0">
							<TimelineNav months={uniqueMonths} />
						</aside>
					</div>
				</div>
			</div>
		</div>
	);
}
