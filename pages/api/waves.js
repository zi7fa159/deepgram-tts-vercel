export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ success: false, message: "Method Not Allowed" });
    }

    const WAVES_API_KEY = process.env.WAVES_API_KEY;
    if (!WAVES_API_KEY) {
        return res.status(500).json({ success: false, message: "Missing Waves API credentials" });
    }

    const text = req.query.text || "Hello";  // Get text from URL parameters
    const voice_id = req.query.voice_id || "emily";  // Default voice
    const format = req.query.format || "mp3";  // Default format

    try {
        const response = await fetch("https://waves-api.smallest.ai/api/v1/lightning/get_speech", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${WAVES_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text, voice_id, format }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({ success: false, message: errorText });
        }

        // Stream the audio response directly to the client
        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Content-Disposition", 'attachment; filename="speech.mp3"');
        response.body.pipe(res);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
