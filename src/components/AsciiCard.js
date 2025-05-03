import React, { useRef, useEffect, useState } from "react";

const asciiArt = `
⣿⣿⣿⣿⣿⣿⡿⢛⠝⣠⡾⠋⠁⢀⣴⡶⣎⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣶⣮⣭⣙⡻⠿⠋⣠⡞⠟⠃⠀⢀⡌⠻⢿⣿⣿
⣿⣿⣿⣿⣿⡿⠁⢀⣼⠟⠀⠀⣀⣽⣿⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡍⢀⣴⡏⠁⠀⠀⢠⣿⣿⣷⣦⡹⣿
⣿⣿⣿⣿⣿⢣⣄⠈⠁⠀⣠⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⠀⠾⠏⡇⠀⡄⣠⡿⣿⣿⣿⣿⣿⣾
⣿⣿⣿⣿⣏⣿⣿⡦⢀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄⠀⠀⠀⠀⠐⢿⣿⡼⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⡟⣱⣿⣿⣿⣿⣿⣿⠃⣿⡿⣿⣿⣿⣿⣿⡟⠈⢿⣿⣿⣿⣿⢿⣻⣿⣿⣿⣿⡄⠀⠀⠀⠘⣮⣿⠝⢻⣿⣿⣿⣿
⣿⣿⣿⣿⣿⢏⣼⡿⣻⣿⣿⣿⣿⠃⢀⢹⡇⣿⣿⣿⣿⣿⣷⠀⡈⢻⣿⣿⣿⣎⢿⣏⢿⣿⣿⣷⡀⠀⠀⠀⠘⣿⡇⠘⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣞⡝⣴⣿⣿⣿⣿⠃⢠⣿⠸⡇⢹⣿⣿⣿⢻⣿⡀⣿⡌⢻⣿⣿⣿⡌⣿⡌⣿⣿⣿⣷⠀⠀⠀⠀⠈⠧⢠⣿⣿⣿⣿
⣿⣿⣿⣿⣿⡿⣸⣿⣿⣿⣿⠇⢀⡛⣛⣇⢇⠈⣿⣿⣿⡎⣿⠁⢛⣛⡀⢛⡿⢿⣿⡘⣧⢹⣿⣿⣿⡇⢠⣄⡀⣠⠀⠈⢻⣿⣿⣿
⣿⣿⣿⣿⣿⢡⣿⣿⣿⣿⡏⢀⡟⣸⣿⣿⡌⠀⡸⣿⣿⣷⢸⠀⢸⣿⣿⣄⠻⣿⣿⣧⢹⢸⣿⣿⣿⣿⠸⡿⢰⣿⠀⢀⠻⣿⣿⣿
⣿⣿⣿⣿⡏⣾⣿⣿⣿⣿⠀⣾⠻⠿⠿⢿⣷⡀⢣⢻⣿⣿⡆⠀⢸⣯⡻⠿⣧⡘⢿⣿⣆⠀⣿⣿⣿⣿⡇⠀⠈⠉⠀⢸⡆⢸⣿⣿
⣿⣿⣿⣿⣁⣿⣿⣿⣿⡇⠘⠁⣠⡶⠂⠀⠙⣷⡈⢧⠹⣿⣇⢠⠈⠉⣠⣤⡄⠈⠙⠿⣿⡄⣿⣿⣿⣿⡇⠰⠖⠃⠀⢸⣷⠈⣿⣿
⣿⣿⣿⣼⣿⣿⣿⣿⣿⠀⢀⣾⣿⠟⠁⠀⠀⣿⣷⡀⣅⢹⣿⠘⡇⣿⣿⡿⠆⠀⠀⠀⠈⠃⠛⣿⣿⣿⡇⠀⠀⠀⠀⣿⣿⠀⣿⣿
⣿⣿⠟⣻⠿⣿⣿⣿⡟⠀⢸⣿⣿⡄⡄⠠⡀⣿⣿⣷⣜⣷⣬⣁⣿⣿⣿⠀⠀⡀⠀⠀⣧⢸⢡⣿⣿⡟⠁⠀⠀⠀⢰⣿⣿⡆⣿⣿
⣿⣿⣤⣿⠀⣿⣿⣿⡇⠀⠀⢿⣿⣷⣼⣯⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇⠻⠯⠟⣰⡟⠀⣾⣿⣿⡇⠀⠀⠀⠀⣿⣿⣿⡇⣿⣿
⣿⣿⣿⣿⡆⢹⣏⢿⡇⢠⣖⠈⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃⣼⣿⣿⣿⡇⠀⠀⠀⣠⣿⣿⣿⣧⣿⣿
⣿⣿⣿⣿⡱⠀⢿⡎⡡⠾⠿⢀⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⣡⢰⢃⣿⣿⣿⠁⠀⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣷⣀⣄⢸⣿⣿⣭⣝⡊⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⠂⣾⣿⣿⡟⢀⡆⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⢿⣿⣿⣿⣿⣿⣿⢠⠙⢿⣿⣿⣿⣷⣬⡻⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠋⡀⢸⣿⣿⢻⠇⠸⠃⠿⠿⠿⣿⣿⣿⣿⣿⣿
⢿⣿⣿⣿⣿⣿⡏⣸⠀⡇⠙⢿⣿⣿⣿⣿⣷⣍⠻⢿⣿⣿⣿⣿⣿⠿⢛⣭⡶⢋⣼⠇⣿⣿⡏⠀⠀⠀⣼⢛⣵⣾⣶⣮⡻⣿⣿⣿
⢸⣿⣿⣿⣿⣿⡇⣿⠀⠁⠀⡀⣍⠻⣿⣿⣿⣿⣧⣠⠙⠛⠋⢭⣶⡿⢟⣩⣶⣿⠟⣼⣿⠟⠀⠀⢀⣾⣵⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⡇⣿⠀⣤⡀⣷⡝⣰⣿⣿⣿⣿⣿⠏⠰⠿⠀⣨⣵⣾⣿⣿⠟⠁⣼⡿⢋⣀⣤⠀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⡇⡿⣸⣿⣷⡟⣼⣿⣿⣿⣿⣿⡏⣠⣾⣿⡆⡸⣿⠿⣋⣵⢎⣚⣫⣴⣿⣿⡏⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⡇⢠⣿⡿⢋⣾⣿⣿⣿⣿⣿⡟⢠⣿⣿⠏⡀⢧⠁⢺⣿⣿⣿⣿⡿⣻⣿⡟⣰⡿⠻⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⡇⣿⠏⠀⣿⣿⣿⣿⣿⣿⡟⠀⣼⡿⢁⢸⣧⣄⢀⡈⢿⣿⣿⣭⣾⣿⡟⣰⡿⣰⠇⣼⡄⣰⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⠘⠁⠆⠀⣿⣿⣿⣿⣿⡟⣰⡶⣿⢡⠏⢸⣿⠋⠚⣡⡈⣿⣿⣿⣿⠟⣱⣿⣇⠉⣴⠟⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿
`;

export default function AsciiCard() {
	const containerRef = useRef(null);
	const contentRef = useRef(null);
	const [scrollDir, setScrollDir] = useState(1);

	useEffect(() => {
		const container = containerRef.current;
		const content = contentRef.current;
		if (!container || !content) return;

		let pos = 0;
		let dir = 1;
		let maxScroll = Math.max(0, content.scrollWidth - container.clientWidth);

		const animate = () => {
			if (maxScroll === 0) return;
			pos += dir * 1.5; // 滚动速度
			if (pos >= maxScroll) {
				pos = maxScroll;
				dir = -1;
			} else if (pos <= 0) {
				pos = 0;
				dir = 1;
			}
			container.scrollLeft = pos;
			requestAnimationFrame(animate);
		};

		let raf = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(raf);
	}, []);

	return (
		<div
			ref={containerRef}
			className="w-full mt-4 p-2 bg-gray-900 border-2 border-blue-400 rounded-xl shadow-inner overflow-x-auto"
			style={{ whiteSpace: "nowrap" }}
		>
			<pre
				ref={contentRef}
				className="font-mono text-xs leading-[1.1] text-green-400 whitespace-pre"
				style={{ minWidth: "max-content" }}
			>
				{asciiArt}
			</pre>
		</div>
	);
}
