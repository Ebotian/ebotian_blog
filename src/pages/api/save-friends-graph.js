import fs from "fs";
import path from "path";

export default function handler(req, res) {
	if (req.method !== "POST") {
		res.status(405).json({ error: "Method not allowed" });
		return;
	}
	const data = req.body;
	const filePath = path.join(process.cwd(), "public/data/friends-graph.json");
	try {
		fs.writeFileSync(
			filePath,
			typeof data === "string" ? data : JSON.stringify(data, null, 2)
		);
		res.status(200).json({ ok: true });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
}
