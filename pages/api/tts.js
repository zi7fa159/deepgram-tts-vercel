export default async function handler(req, res) {
  console.log("Deepgram URL:", process.env.DEEPGRAM_TTS_API_URL);
  console.log("Deepgram API Key:", process.env.DEEPGRAM_API_KEY ? "Present" : "Missing");

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Only GET requests allowed" });
  }

  const { text } = req.query;
  if (!text) {
    return res.status(400).json({ message: "No text provided" });
  }

  if (!process.env.DEEPGRAM_TTS_API_URL || !process.env.DEEPGRAM_API_KEY) {
    return res.status(500).json({ success: false, message: "Missing Deepgram API credentials" });
  }

  try {
    const response = await fetch(process.env.DEEPGRAM_TTS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${process.env.DEEPGRAM_API_KEY}`,
      },
      body: JSON.stringify({
        text,
        model: "aura-perseus-en" // ✅ Correct way to specify Perseus voice
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Deepgram API Error:", errorText);
      return res.status(response.status).json({ success: false, message: errorText });
    }

    // Convert response to buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Set headers to force download
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", `attachment; filename="tts_audio.mp3"`);
    res.setHeader("Content-Length", buffer.length);

    res.status(200).send(buffer);
  } catch (error) {
    console.error("Fetch Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
