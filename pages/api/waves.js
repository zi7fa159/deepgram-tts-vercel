export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ success: false, message: "Method Not Allowed" });
    }

    const { text = "Hello", voice_id = "emily", format = "mp3" } = req.query;

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

        // Convert response to buffer (fixes Vercel streaming issue)
        const audioBuffer = await apiResponse.arrayBuffer();

        // Set correct response headers
        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Content-Disposition", 'attachment; filename="speech.mp3"');
        res.setHeader("Content-Length", audioBuffer.byteLength);

        // Send fixed MP3 binary data
        res.end(Buffer.from(audioBuffer));
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
