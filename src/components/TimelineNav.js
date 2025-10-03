import React, { useState, useEffect, useRef } from "react";

// 辅助函数：将 YYYY-MM 格式化为 "YYYY年 M月"
const formatMonthYear = (monthYearStr) => {
	if (!monthYearStr || monthYearStr.length !== 7) return "";
	const [year, month] = monthYearStr.split("-");
	return `${year}年 ${parseInt(month, 10)}月`;
};

export default function TimelineNav({ months }) {
	const [activeMonth, setActiveMonth] = useState(null);
	const navScrollRef = useRef(null); // 可滚动导航元素的引用
	const listItemsRef = useRef({}); // 每个 <li> 元素的引用（用于居中滚动）
	const observerTargetsRef = useRef({}); // 每个 H2 元素的引用（用于 IntersectionObserver）

	// Intersection Observer 监听月份分隔符
	useEffect(() => {
		observerTargetsRef.current = {}; // 每次 months 变化时清空引用

		const observerCallback = (entries) => {
			const intersectingEntries = entries.filter(
				(entry) => entry.isIntersecting
			);

			if (intersectingEntries.length > 0) {
				// 按照距离视口顶部最近排序
				intersectingEntries.sort(
					(a, b) => a.boundingClientRect.top - b.boundingClientRect.top
				);
				// 取第一个（最靠上的）作为当前激活月份
				const bestEntry = intersectingEntries[0];
				const monthId = bestEntry.target.id.substring(6); // 提取 'YYYY-MM'
				setActiveMonth(monthId);
			}
			// 如果没有任何元素处于激活区，可以清空激活状态或设置为第一个月份
			// else {
			//     setActiveMonth(months.length > 0 ? months[0] : null);
			// }
		};

		const observer = new IntersectionObserver(observerCallback, {
			// 定义激活区：距离顶部10%到15%视口高度
			rootMargin: "-10% 0px -85% 0px",
			threshold: 0, // 只要进入激活区就触发
		});

		// 查找并监听所有月份分隔符 H2 元素
		months.forEach((month) => {
			const element = document.getElementById(`month-${month}`);
			if (element) {
				observerTargetsRef.current[month] = element; // 存储引用
				observer.observe(element);
			}
		});

		// 清理函数
		return () => {
			months.forEach((month) => {
				const element = observerTargetsRef.current[month];
				if (element) {
					observer.unobserve(element);
				}
			});
			observer.disconnect();
			observerTargetsRef.current = {};
		};
	}, [months]); // months 变化时重新设置 observer

	// 当 activeMonth 变化时，自动将其滚动到导航栏中间
	useEffect(() => {
		if (
			activeMonth &&
			navScrollRef.current &&
			listItemsRef.current[activeMonth]
		) {
			const navElement = navScrollRef.current;
			const activeListItemElement = listItemsRef.current[activeMonth];

			const navRect = navElement.getBoundingClientRect();
			const itemRect = activeListItemElement.getBoundingClientRect();

			const desiredScrollTop =
				navElement.scrollTop +
				(itemRect.top - navRect.top) -
				navRect.height / 2 +
				itemRect.height / 2;

			navElement.scrollTo({
				top: desiredScrollTop,
				behavior: "smooth",
			});
		}
	}, [activeMonth]);

	if (!months || months.length === 0) {
		return null;
	}

	return (
		<nav className="sticky top-20 hidden lg:block w-40 flex-shrink-0 ml-8 pr-4">
			{/* 可滚动的时间轴容器：移动 max-height 与 overflow 到内部 div，使按钮不属于滚动区域 */}
			<div
				ref={navScrollRef}
				className="max-h-[calc(100vh-10rem)] overflow-y-auto custom-scrollbar"
			>
				<h3
					className="text-lg font-semibold mb-4 pl-4 sticky top-0 z-10 pt-1"
					style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
				>
					时间轴
				</h3>
				<ul
					className="relative border-l-2 ml-4 mt-2"
					style={{ borderColor: "rgba(4,120,87,0.6)" }}
				>
					{months.map((month) => {
						const isActive = month === activeMonth;
						return (
							<li
								key={month}
								ref={(el) => (listItemsRef.current[month] = el)}
								className="relative mb-3 pl-6"
							>
								<span
									className="absolute -left-[calc(0.375rem+1px)] top-1 w-3 h-3 rounded-full border-2 transition-all duration-200"
									style={{
										transformOrigin: "center",
										backgroundColor: isActive
											? "rgba(59,130,246,0.7)"
											: "rgba(4,120,87,0.9)",
										borderColor: isActive
											? "rgba(219,234,254,0.9)"
											: "rgba(34,197,94,0.6)",
										transform: isActive ? "scale(1.1)" : "scale(1)",
									}}
								></span>
								<a
									href={`#month-${month}`}
									className={`block text-sm ${
										isActive ? "font-bold" : ""
									} transition-colors duration-200`}
									style={{ color: "var(--text)", opacity: isActive ? 1 : 0.72 }}
								>
									{formatMonthYear(month)}
								</a>
							</li>
						);
					})}
				</ul>
			</div>

			{/* 按钮放在可滚动区域之外，始终可见 */}
			<div className="mt-4 pl-4 pr-4">
				<button
					className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-md border-2 transition-colors"
					title="回到顶部"
					aria-label="回到顶部"
					style={{
						backgroundColor: "var(--card-bg)",
						color: "var(--card-text)",
						borderColor: "rgba(34,197,94,0.6)",
					}}
					onClick={() => {
						if (typeof window !== "undefined") {
							window.scrollTo({ top: 0, behavior: "smooth" });
						}
					}}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="w-4 h-4"
					>
						<polyline points="18 15 12 9 6 15"></polyline>
					</svg>
					<span className="text-sm">回到顶部</span>
				</button>
			</div>
		</nav>
	);
}

// 建议在全局 CSS 或组件 CSS 文件中添加如下滚动条样式：
