import React, { useState, useEffect, useRef } from "react";

// 辅助函数：将 YYYY-MM 格式化为 "YYYY年 M月"
const formatMonthYear = (monthYearStr) => {
	if (!monthYearStr || monthYearStr.length !== 7) return "";
	const [year, month] = monthYearStr.split("-");
	return `${year}年 ${parseInt(month, 10)}月`;
};

export default function TimelineNav({ months }) {
	const [activeMonth, setActiveMonth] = useState(null);
	const navScrollRef = useRef(null); // Ref for the scrollable NAV element
	const listItemsRef = useRef({}); // Refs for each list item <li> (for centering)
	const observerTargetsRef = useRef({}); // Refs for H2 elements (for observer)

	// Effect for Intersection Observer
	useEffect(() => {
		observerTargetsRef.current = {}; // Clear observer targets on months change

		const observerCallback = (entries) => {
			const intersectingEntries = entries.filter(
				(entry) => entry.isIntersecting
			);

			if (intersectingEntries.length > 0) {
				// Sort intersecting entries by their top position (closest to the top edge of the viewport)
				intersectingEntries.sort(
					(a, b) => a.boundingClientRect.top - b.boundingClientRect.top
				);
				// The first entry is the topmost one currently intersecting the rootMargin zone
				const bestEntry = intersectingEntries[0];
				const monthId = bestEntry.target.id.substring(6); // Extract 'YYYY-MM'
				setActiveMonth(monthId);
			}
			// If nothing is intersecting (e.g., scrolled above the first section),
			// you might want to clear the active state or set it to the first month.
			// else {
			//     setActiveMonth(months.length > 0 ? months[0] : null);
			// }
		};

		const observer = new IntersectionObserver(observerCallback, {
			// Define the "active" zone near the top of the viewport.
			// -10% from top, -85% from bottom = active zone is between 10% and 15% viewport height from the top.
			rootMargin: "-10% 0px -85% 0px",
			threshold: 0, // Trigger as soon as intersection starts/ends within the zone
		});

		// Find and observe all month separator H2 elements
		months.forEach((month) => {
			const element = document.getElementById(`month-${month}`);
			if (element) {
				observerTargetsRef.current[month] = element; // Store H2 ref for cleanup
				observer.observe(element);
			}
		});

		// Cleanup function
		return () => {
			months.forEach((month) => {
				const element = observerTargetsRef.current[month];
				if (element) {
					observer.unobserve(element);
				}
			});
			observer.disconnect();
			observerTargetsRef.current = {}; // Clear refs on cleanup
		};
	}, [months]); // Re-run observer setup if months array changes

	// Effect to scroll the active item towards the center of the nav
	useEffect(() => {
		// Use listItemsRef here for the LI elements
		if (
			activeMonth &&
			navScrollRef.current &&
			listItemsRef.current[activeMonth]
		) {
			const navElement = navScrollRef.current;
			const activeListItemElement = listItemsRef.current[activeMonth]; // Get the LI element ref

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
	}, [activeMonth]); // Run when activeMonth changes

	if (!months || months.length === 0) {
		return null;
	}

	return (
		<nav
			ref={navScrollRef} // Ref for scrolling the nav itself
			className="sticky top-20 max-h-[calc(100vh-10rem)] overflow-y-auto hidden lg:block w-40 flex-shrink-0 ml-8 pr-4"
		>
			<h3 className="text-lg font-semibold text-blue-200 mb-4 pl-4 sticky top-0 bg-black z-10 pt-1">
				时间轴
			</h3>
			<ul className="relative border-l-2 border-green-700 ml-4 mt-2">
				{months.map((month) => {
					const isActive = month === activeMonth;
					return (
						<li
							key={month}
							// Store ref to the LI element for the centering effect
							ref={(el) => (listItemsRef.current[month] = el)}
							className="relative mb-3 pl-6"
						>
							<span
								className={`absolute -left-[calc(0.375rem+1px)] top-1 w-3 h-3 rounded-full border-2 ${
									isActive
										? "bg-blue-300 border-blue-100 scale-110"
										: "bg-green-700 border-green-500"
								} transition-all duration-200`}
								style={{ transformOrigin: "center" }}
							></span>
							<a
								href={`#month-${month}`}
								className={`block text-sm ${
									isActive
										? "font-bold text-blue-100"
										: "text-green-300 hover:text-green-100"
								} transition-colors duration-200`}
							>
								{formatMonthYear(month)}
							</a>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
