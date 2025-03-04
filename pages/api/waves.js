import axios from "axios";

export default async function handler(req, res) {
    console.log("🟢 New request received");

    if (req.method !== "GET") {
        console.log("❌ Invalid method:", req.method);
        return res.status(405).json({ success: false, message: "Method Not Allowed" });
    }

    const { text } = req.query;
    if (!text) {
        console.log("❌ Missing text parameter");
        return res.status(400).json({ success: false, message: "Missing text parameter" });
    }

    console.log(`🔹 Text received: ${text}`);

    try {
        const apiUrl = "https://waves-api.smallest.ai/api/v1/lightning/get_speech";
        const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2M2NTJjZWZlNGVkZmExNTk4MDk4ZjEiLCJpYXQiOjE3NDEwNTQ5MjJ9.zoHXDZvg9DWUMqBrAgfhuAVzkqRKYwjDoKE8eMriT0g";

        console.log("🔹 Sending request to Waves API...");

        const response = await axios.post(apiUrl, {
            text: text,
            voice_id: "emily",
            format: "mp3"
        }, {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            responseType: "arraybuffer"  // Binary response
        });

        console.log("✅ Response received from Waves API");
        console.log("🔹 Response Status:", response.status);
        console.log("🔹 Response Headers:", response.headers);

        if (!response.data || response.data.length < 10) {
            console.log("❌ Invalid or empty audio data received");
            throw new Error("Received invalid audio data");
        }

        console.log("🔹 Content-Type:", response.headers["content-type"]);
        console.log("🔹 Content-Length:", response.headers["content-length"]);
        console.log("🔹 First 20 bytes:", response.data.slice(0, 20));  // Log MP3 header

        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Content-Disposition", 'attachment; filename="speech.mp3"');
        res.setHeader("Content-Length", response.data.length.toString());

        console.log("🚀 Sending MP3 file to client...");
        res.status(200).send(Buffer.from(response.data));
        console.log("✅ File sent successfully!");

    } catch (error) {
        console.error("❌ Error fetching TTS:", error?.response?.data || error.message);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error?.response?.data || error.message });
    }
}
