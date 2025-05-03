import { remark } from "remark";
import html from "remark-html";

// 将 markdown 文本转为 HTML 字符串
export async function markdownToHtml(markdown) {
  const result = await remark().use(html).process(markdown);
  return result.toString();
}
