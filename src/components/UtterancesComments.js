import React, { useEffect, useRef } from "react";
const UtterancesComments = () => {
	const commentsContainerRef = useRef(null);
	const observerRef = useRef(null);

	function createUtterances(theme) {
		const container = commentsContainerRef.current;
		if (!container) return;
		// clear any existing
		while (container.firstChild) container.removeChild(container.firstChild);

		const script = document.createElement("script");
		script.src = "https://utteranc.es/client.js";
		script.async = true;
		script.setAttribute("repo", "Ebotian/ebotian_blog");
		script.setAttribute("issue-term", "pathname");
		script.setAttribute("label", "💬 utterances");
		// map our data-theme to an utterances theme name
		// prefer a dark theme when data-theme is dark
		const utterTheme = theme === "light" ? "github-light" : "github-dark";
		script.setAttribute("theme", utterTheme);
		script.crossOrigin = "anonymous";
		container.appendChild(script);
	}

	useEffect(() => {
		const container = commentsContainerRef.current;
		if (!container) return;

		// initial create based on current html[data-theme]
		const initialTheme =
			document.documentElement.getAttribute("data-theme") || "dark";
		createUtterances(initialTheme);

		// observe changes to data-theme on <html>
		const htmlEl = document.documentElement;
		const observer = new MutationObserver((mutations) => {
			for (const m of mutations) {
				if (m.type === "attributes" && m.attributeName === "data-theme") {
					const newTheme = htmlEl.getAttribute("data-theme") || "dark";
					createUtterances(newTheme);
				}
			}
		});
		observer.observe(htmlEl, { attributes: true });
		observerRef.current = observer;

		return () => {
			// cleanup observer and container
			if (observerRef.current) observerRef.current.disconnect();
			while (container.firstChild) container.removeChild(container.firstChild);
		};
	}, []);

	return <div ref={commentsContainerRef} className="utterances-container" />;
};

export default UtterancesComments;
