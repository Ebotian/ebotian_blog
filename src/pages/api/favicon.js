import fetch from "node-fetch";
import { JSDOM } from "jsdom";

export default async function handler(req, res) {
	const { url } = req.query;
	if (!url) {
		res.status(400).json({ error: "Missing url parameter" });
		return;
	}
	try {
		// 1. 获取 HTML
		const response = await fetch(url, {
			timeout: 15000,
			headers: {
				"Cache-Control": "no-cache",
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
			},
		});
		if (!response.ok) throw new Error("Fetch failed");
		const html = await response.text();
		// 2. 解析 <head> 里的 favicon 链接
		let dom, doc, links;
		try {
			dom = new JSDOM(html);
			doc = dom.window.document;
			links = Array.from(
				doc.querySelectorAll(
					'link[rel~="icon"], link[rel="apple-touch-icon"], link[rel="shortcut icon"]'
				)
			);
		} catch (err) {
			links = [];
		}
		let favicon = "";
		for (const link of links) {
			const href = link.getAttribute("href");
			if (href) {
				// 绝对/相对路径处理
				if (/^https?:\/\//.test(href)) {
					favicon = href;
				} else if (href.startsWith("//")) {
					favicon = "https:" + href;
				} else if (href.startsWith("/")) {
					const u = new URL(url);
					favicon = u.origin + href;
				} else {
					// 相对路径
					const u = new URL(url);
					favicon = u.origin + "/" + href.replace(/^\/*/, "");
				}
				break;
			}
		}
		// 3. 没找到就 fallback /favicon.ico
		if (!favicon) {
			const u = new URL(url);
			favicon = u.origin + "/favicon.ico";
		}
		res.status(200).json({ favicon });
	} catch (e) {
		// 失败时 favicon 为空字符串
		res.status(200).json({ favicon: "", error: e.message });
	}
}
