import { useEffect } from "react";

// Maps our html[data-theme] values to highlight.js CSS filenames (github style)
const THEME_MAP = {
	light: {
		href: "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github.min.css",
	},
	dark: {
		href: "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github-dark.min.css",
	},
};

function setHighlightCss(href) {
	if (typeof document === "undefined") return null;
	// Remove existing loader if present
	const existing = document.getElementById("hljs-theme-stylesheet");
	if (existing) existing.remove();

	if (!href) return null;
	const link = document.createElement("link");
	link.id = "hljs-theme-stylesheet";
	link.rel = "stylesheet";
	link.href = href;
	link.crossOrigin = "anonymous";
	document.head.appendChild(link);
	return link;
}

export default function HighlightThemeLoader() {
	useEffect(() => {
		if (typeof document === "undefined") return;

		const getTheme = () =>
			document.documentElement.getAttribute("data-theme") || "dark";

		const apply = () => {
			const t = getTheme();
			const cfg = THEME_MAP[t] || THEME_MAP.dark;
			try {
				setHighlightCss(cfg.href);
			} catch (e) {
				// ignore
			}
		};

		apply();

		const mo = new MutationObserver((mutations) => {
			for (const m of mutations) {
				if (m.type === "attributes" && m.attributeName === "data-theme") {
					apply();
					break;
				}
			}
		});
		mo.observe(document.documentElement, { attributes: true });

		return () => {
			mo.disconnect();
			const existing = document.getElementById("hljs-theme-stylesheet");
			if (existing) existing.remove();
		};
	}, []);

	return null;
}
