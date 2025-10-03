import "../styles/globals.css"; // 引入全局样式
import HighlightThemeLoader from "../components/HighlightThemeLoader";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }) {
	const router = useRouter();

	// 定义动画的不同状态
	const variants = {
		hidden: { opacity: 0, x: 0, y: 20 }, // 初始状态：稍微下移且透明
		enter: { opacity: 1, x: 0, y: 0 }, // 进入状态：完全显示并回到原位
		exit: { opacity: 0, x: 0, y: -20 }, // 离开状态：稍微上移且透明
	};

	return (
		<AnimatePresence
			mode="wait" // 等待前一个页面动画结束再进入新页面
			initial={false} // 首次加载时不执行进入动画
		>
			{/* 使用 router.route 作为 key，确保页面切换时动画生效 */}
			<motion.div
				key={router.route}
				variants={variants} // 应用动画状态
				initial="hidden" // 初始动画状态
				animate="enter" // 进入动画状态
				exit="exit" // 离开动画状态
				transition={{ type: "linear", duration: 0.3 }} // 动画过渡类型和时长
			>
				{/* 管理 highlight.js 的主题样式（根据 html[data-theme] 切换 GitHub 风格主题） */}
				<HighlightThemeLoader />
				<Component {...pageProps} />
			</motion.div>
		</AnimatePresence>
	);
}

export default MyApp;
