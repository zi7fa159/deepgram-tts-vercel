export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ success: false, message: "Method Not Allowed" });
    }

    const API_URL = process.env.WAVES_API_URL;
    const API_KEY = process.env.WAVES_API_KEY;

    if (!API_URL || !API_KEY) {
        console.error("Missing Waves API credentials");
        return res.status(500).json({ success: false, message: "Missing Waves API credentials" });
    }

    const text = req.query.text || "Hello, this is a test!";
    const voice_id = req.query.voice_id || "default_voice"; // Change to an actual voice_id

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text,
                voice_id,
                format: "mp3",
            }),
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            console.error("Waves API Error:", errorResponse);
            return res.status(500).json({ success: false, message: "Waves API error", error: errorResponse });
        }

        // Set headers to return MP3 directly
        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Content-Disposition", `attachment; filename="speech.mp3"`);

        const audioStream = await response.body;
        audioStream.pipe(res);

    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}
