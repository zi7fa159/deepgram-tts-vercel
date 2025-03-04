export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ success: false, message: "Method Not Allowed" });
    }

    const { text = "Hello", voice_id = "emily", format = "mp3" } = req.query;

    try {
        const response = await fetch("https://waves-api.smallest.ai/api/v1/lightning/get_speech", {
            method: "POST",
            headers: {
                "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2M2NTJjZWZlNGVkZmExNTk4MDk4ZjEiLCJpYXQiOjE3NDEwNTQ5MjJ9.zoHXDZvg9DWUMqBrAgfhuAVzkqRKYwjDoKE8eMriT0g",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text, voice_id, format }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Waves API Error:", errorText);
            return res.status(response.status).json({ success: false, message: errorText });
        }

        // Convert response to buffer
        const audioBuffer = await response.arrayBuffer();

        // Set response headers for audio file
        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Content-Length", audioBuffer.byteLength);
        res.setHeader("Content-Disposition", "inline; filename=speech.mp3");

        // Send audio file
        res.send(Buffer.from(audioBuffer));
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ success: false, message: error.toString() });
    }
}
