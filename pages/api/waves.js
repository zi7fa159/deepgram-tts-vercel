import axios from "axios";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ success: false, message: "Method Not Allowed" });
    }

    const { text } = req.query;
    if (!text) {
        return res.status(400).json({ success: false, message: "Missing text parameter" });
    }

    try {
        const apiUrl = "https://waves-api.smallest.ai/api/v1/lightning/get_speech";
        const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2M2NTJjZWZlNGVkZmExNTk4MDk4ZjEiLCJpYXQiOjE3NDEwNTQ5MjJ9.zoHXDZvg9DWUMqBrAgfhuAVzkqRKYwjDoKE8eMriT0g";

        const response = await axios.post(apiUrl, {
            text: text,
            voice_id: "emily",
            format: "mp3"
        }, {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            responseType: "stream"  // Ensure response is treated as a stream
        });

        // Set headers to force file download
        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Content-Disposition", `attachment; filename="speech.mp3"`);

        // Pipe the response directly to the client
        response.data.pipe(res);
    } catch (error) {
        console.error("Error fetching TTS:", error?.response?.data || error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
