// filepath: /home/ebit/ebotian_blog/src/lib/markdown.js
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype"; // ADD THIS
import rehypeStringify from "rehype-stringify"; // ADD THIS
import rehypeHighlight from "rehype-highlight";
// import html from "remark-html";                // REMOVE or comment out this import

// import remarkMermaid from "remark-mermaidjs"; // Temporarily comment out for testing

export async function markdownToHtml(markdown) {
	// console.log("Using rehypeHighlight version:", rehypeHighlight.version); // Log version if available
	const result = await remark()
		.use(remarkGfm)
		// .use(remarkMermaid, { // Temporarily comment out for testing
		//     strategy: 'hybrid'
		// })
		// .use(html, { sanitize: false }) // REMOVE or comment out this line
		.use(remarkRehype, { allowDangerousHtml: true }) // Convert mdast to hast, preserve raw HTML if sanitize:false was intended
		.use(rehypeHighlight, {
			// Apply highlighting on the hast
			detect: true,
			ignoreMissing: true,
			// plainText: ['mermaid'] // This was commented, keep as is unless mermaid also needs hljs treatment
		})
		.use(rehypeStringify, { allowDangerousHtml: true }) // Convert hast to HTML string, preserve raw HTML
		.process(markdown);
	return result.toString();
}
