import fetch from "node-fetch";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ success: false, message: "Method Not Allowed" });
    }

    const { text = "Hello", voice_id = "emily", format = "mp3" } = req.query;

    if (!text || !voice_id) {
        return res.status(400).json({ success: false, message: "Missing required parameters" });
    }

    try {
        const apiResponse = await fetch("https://waves-api.smallest.ai/api/v1/lightning/get_speech", {
            method: "POST",
            headers: {
                "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2M2NTJjZWZlNGVkZmExNTk4MDk4ZjEiLCJpYXQiOjE3NDEwNTQ5MjJ9.zoHXDZvg9DWUMqBrAgfhuAVzkqRKYwjDoKE8eMriT0g",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text, voice_id, format }),
        });

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            console.error("Waves API Error:", errorText);
            return res.status(apiResponse.status).json({ success: false, message: errorText });
        }

        // Convert response to buffer
        const audioBuffer = await apiResponse.arrayBuffer();
        const buffer = Buffer.from(audioBuffer);

        // Validate MP3 content
        if (buffer.length < 1000) {
            console.error("Invalid MP3 File: Too small!");
            return res.status(500).json({ success: false, message: "Invalid MP3 File" });
        }

        // Set headers for direct MP3 response
        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Content-Disposition", 'attachment; filename="speech.mp3"');
        res.setHeader("Content-Length", buffer.length);

        // Send MP3 file
        res.end(buffer);
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
