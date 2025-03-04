// pages/api/waves.js

export default async function handler(req, res) {
  console.log("Waves API URL:", process.env.WAVES_API_URL);
  console.log("Waves API Key:", process.env.WAVES_API_KEY ? "Present" : "Missing");

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Only GET requests allowed" });
  }

  const { text, voice_id = 'emily', sample_rate = 24000, speed = 1.0, format = 'mp3' } = req.query;

  if (!text) {
    return res.status(400).json({ message: "No text provided" });
  }

  if (!process.env.WAVES_API_URL || !process.env.WAVES_API_KEY) {
    return res.status(500).json({ success: false, message: "Missing Waves API credentials" });
  }

  const requestBody = {
    text,
    voice_id,
    sample_rate: parseInt(sample_rate, 10),
    speed: parseFloat(speed),
    format,
  };

  try {
    const response = await fetch(process.env.WAVES_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WAVES_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Waves API Error:", errorText);
      return res.status(response.status).json({ success: false, message: errorText });
    }

    // Stream the audio response directly to the client
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", 'attachment; filename="tts_audio.mp3"');
    response.body.pipe(res);
  } catch (error) {
    console.error("Fetch Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
