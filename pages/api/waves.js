import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ success: false, message: "Method Not Allowed" });
    return;
  }

  const { text = "Hello", voice_id = "emily", format = "mp3" } = req.query;

  try {
    const response = await axios.post(
      "https://waves-api.smallest.ai/api/v1/lightning/get_speech",
      { text, voice_id, format },
      {
        headers: {
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2M2NTJjZWZlNGVkZmExNTk4MDk4ZjEiLCJpYXQiOjE3NDEwNTQ5MjJ9.zoHXDZvg9DWUMqBrAgfhuAVzkqRKYwjDoKE8eMriT0g",
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    const buffer = Buffer.from(response.data, "binary");

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", 'attachment; filename="speech.mp3"');
    res.setHeader("Content-Length", buffer.length);

    res.end(buffer);
  } catch (error) {
    console.error("Axios Error:", error);
    res.status(500).json({ success: false, message: error.toString() });
  }
}
