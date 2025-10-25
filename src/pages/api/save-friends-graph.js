import fs from "fs";
import path from "path";

export default function handler(req, res) {
	if (req.method !== "POST") {
		res.status(405).json({ error: "Method not allowed" });
		return;
	}
	const data = req.body;
	const filePath = path.join(process.cwd(), "public/data/friends-graph.json");
	let written = false;
	let errorMsg = null;
	try {
		console.log("[save-friends-graph] attempt write to", filePath);
		fs.writeFileSync(
			filePath,
			typeof data === "string" ? data : JSON.stringify(data, null, 2)
		);
		written = true;
		console.log("[save-friends-graph] write success");
	} catch (e) {
		errorMsg = e && e.message ? e.message : String(e);
		console.error("[save-friends-graph] write error", errorMsg);
	}
	// 返回尽可能多的调试信息，客户端可以用返回的 data 触发下载
	res.status(written ? 200 : 500).json({
		ok: written,
		written,
		error: errorMsg,
		filePath,
		data,
		timestamp: new Date().toISOString(),
	});
}
