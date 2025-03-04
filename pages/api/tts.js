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
    // Create a URL object from the Deepgram TTS API URL
    const ttsUrl = new URL(process.env.DEEPGRAM_TTS_API_URL);
    // Append the voice parameters to the query string
    ttsUrl.searchParams.append('dg-model-name', 'aura-perseus-en');
    ttsUrl.searchParams.append('dg-model-uuid', 'e2e5cac7-1e3e-4c6c-8703-d1ba0eddb781');

    // Send only the text as JSON body
    const response = await fetch(ttsUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${process.env.DEEPGRAM_API_KEY}`,
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Deepgram API Error:", errorText);
      return res.status(response.status).json({ success: false, message: errorText });
    }

    // Convert the response to a buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Set headers to force a download of the generated MP3 file
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", `attachment; filename="tts_audio.mp3"`);
    res.setHeader("Content-Length", buffer.length);

    res.status(200).send(buffer);
  } catch (error) {
    console.error("Fetch Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
