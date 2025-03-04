export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Only GET requests allowed' });
  }

  const { text } = req.query;
  if (!text) {
    return res.status(400).json({ message: 'No text provided' });
  }

  // Check that necessary environment variables are set
  if (!process.env.WAVES_TTS_API_URL || !process.env.WAVES_API_KEY) {
    return res
      .status(500)
      .json({ success: false, message: 'Missing Waves API credentials' });
  }

  try {
    // Call the Waves TTS API
    const response = await fetch(process.env.WAVES_TTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Waves docs may specify a different auth header. Adjust if necessary.
        'Authorization': `Bearer ${process.env.WAVES_API_KEY}`
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Waves API Error:', errorText);
      return res.status(response.status).json({ success: false, message: errorText });
    }

    // Convert the response to a Buffer (assuming the API returns audio data)
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Set headers to trigger a download (or play in-browser)
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'attachment; filename="waves_tts.mp3"');
    res.setHeader('Content-Length', buffer.length);

    // Send the audio data directly to the client
    return res.status(200).send(buffer);
  } catch (error) {
    console.error('Fetch Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
