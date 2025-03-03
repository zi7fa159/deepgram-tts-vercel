export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Only GET requests allowed" });
  }

  const { text, id, voice } = req.query;
  if (!text) {
    return res.status(400).json({ message: "No text provided" });
  }

  try {
    // Call the Deepgram TTS API using POST even though this endpoint is triggered via GET.
    const response = await fetch(process.env.DEEPGRAM_TTS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${process.env.DEEPGRAM_API_KEY}`,
      },
      body: JSON.stringify({ text, voice }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ success: false, message: errorText });
    }

    // We assume the Deepgram API processed the text and generated the audio.
    // For demo purposes, we assume the audio file is available at /speech/{id}.mp3.
    return res.status(200).json({ success: true, url: `/speech/${id}.mp3` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
