import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import remarkMermaid from "remark-mermaidjs"; // Import remark-mermaidjs

// 将 markdown 文本转为 HTML 字符串
export async function markdownToHtml(markdown) {
    const result = await remark()
        .use(remarkGfm)
        .use(remarkMermaid, {
            // Use 'hybrid' strategy for client-side rendering
            // This will output <div class="mermaid">...diagram code...</div>
            strategy: 'hybrid'
        })
        .use(html, { sanitize: false }) // sanitize:false allows the div.mermaid and later SVG
        .use(rehypeHighlight, {
            // rehype-highlight should not interfere with the content of <div class="mermaid">
            // detect: true, // Already set
            // ignoreMissing: true, // Already set
        })
        .process(markdown);
    return result.toString();
}