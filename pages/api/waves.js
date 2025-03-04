import fetch from "node-fetch";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    const { text, voice_id = "emily", format = "mp3" } = req.query;
    if (!text) {
        return res.status(400).json({ success: false, message: "Missing 'text' parameter" });
    }

    const WAVES_API_KEY = process.env.WAVES_API_KEY;
    if (!WAVES_API_KEY) {
        return res.status(500).json({ success: false, message: "Missing Waves API credentials" });
    }

    try {
        const response = await fetch("https://waves-api.smallest.ai/api/v1/lightning/get_speech", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${WAVES_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text, voice_id, format })
        });

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({ success: false, message: errorText });
        }

        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Content-Disposition", 'inline; filename="speech.mp3"');

        response.body.pipe(res);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
