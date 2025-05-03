import "../styles/globals.css"; // Adjust path if your global CSS is elsewhere
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }) {
	const router = useRouter();

	// Define animation variants
	const variants = {
		hidden: { opacity: 0, x: 0, y: 20 }, // Start slightly down and faded out
		enter: { opacity: 1, x: 0, y: 0 }, // Fade in and move up to final position
		exit: { opacity: 0, x: 0, y: -20 }, // Fade out and move slightly up
	};

	return (
		<AnimatePresence
			mode="wait" // Wait for the exiting page to finish animating before starting the entering page
			initial={false} // Don't run enter animation on initial load
			onExitComplete={() => window.scrollTo(0, 0)} // Scroll to top after exit animation
		>
			{/* Use router.route as key for AnimatePresence to detect page changes */}
			<motion.div
				key={router.route}
				variants={variants} // Apply the animation variants
				initial="hidden" // Initial state
				animate="enter" // Animation state
				exit="exit" // Exit state
				transition={{ type: "linear", duration: 0.3 }} // Adjust timing/easing as needed
			>
				<Component {...pageProps} />
			</motion.div>
		</AnimatePresence>
	);
}

export default MyApp;
