import React, { useEffect, useRef } from "react";
import Card from "./Card";
import mermaid from "mermaid";

export default function ArticleContent({ title, date, contentHtml }) {
	const articleRef = useRef(null); // Keep ref for article container if needed for other things

	useEffect(() => {
		mermaid.initialize({
			startOnLoad: false, // We will call mermaid.run() manually
			theme: "neutral",
			// securityLevel: 'loose', // Consider if you have complex HTML in diagrams, usually not needed for standard mermaid
		});

		// Defer mermaid execution slightly to ensure DOM is fully updated
		const timerId = setTimeout(() => {
			try {
				console.log(
					"Attempting mermaid.run() to find and render '.mermaid' divs."
				);
				// mermaid.run() without arguments will find all elements with class "mermaid"
				mermaid
					.run()
					.then(() => {
						console.log(
							"Mermaid run completed successfully for '.mermaid' divs."
						);
					})
					.catch((err) => {
						console.error(
							"Mermaid rendering error (deferred for .mermaid divs):",
							err
						);
						if (err && err.str) {
							console.error("Mermaid error string:", err.str);
						}
					});
			} catch (error) {
				console.error(
					"Error calling mermaid.run (deferred for .mermaid divs catch block):",
					error
				);
			}
		}, 0); // A delay of 0ms pushes execution to the end of the event loop

		return () => clearTimeout(timerId); // Cleanup the timeout
	}, [contentHtml]);

	return (
		<Card hoverEffect={false}>
			<article ref={articleRef}>
				<h1 className="text-2xl font-bold mb-2 dos-title">{title}</h1>
				<p className="text-sm text-green-300 mb-4">{date}</p>
				<div
					className="prose prose-invert max-w-none text-green-100 dos-article-content"
					dangerouslySetInnerHTML={{ __html: contentHtml }}
				/>
			</article>
		</Card>
	);
}
