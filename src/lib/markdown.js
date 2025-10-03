import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeHighlight from "rehype-highlight";
import hljs from "highlight.js";

// A small rehype plugin to highlight inline <code> elements (not inside <pre>)
function rehypeInlineHighlight() {
	return (tree) => {
		function walk(node, parent) {
			if (!node || typeof node !== "object") return;
			if (node.type === "element" && node.tagName === "code") {
				if (parent && parent.tagName === "pre") return; // skip block code
				// extract text content
				let text = "";
				if (Array.isArray(node.children)) {
					for (const ch of node.children) {
						if (ch.type === "text") text += ch.value;
						else if (ch.type === "element" && Array.isArray(ch.children)) {
							text += ch.children.map((c) => c.value || "").join("");
						}
					}
				}
				if (text) {
					try {
						const res = hljs.highlightAuto(text);
						// replace inline children with raw highlighted HTML
						node.children = [{ type: "raw", value: res.value }];
						node.properties = node.properties || {};
						const existing = node.properties.className || [];
						node.properties.className = (
							Array.isArray(existing) ? existing : [existing]
						).concat([
							"hljs",
							res.language ? `language-${res.language}` : "language-plaintext",
						]);
					} catch (e) {
						// ignore
					}
				}
			}
			if (Array.isArray(node.children)) {
				for (const child of node.children) walk(child, node);
			}
		}
		walk(tree, null);
	};
}

export async function markdownToHtml(markdown) {
	const result = await remark()
		.use(remarkGfm)
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeHighlight, { detect: true, ignoreMissing: true })
		.use(rehypeInlineHighlight)
		.use(rehypeStringify, { allowDangerousHtml: true })
		.process(markdown);
	return result.toString();
}
