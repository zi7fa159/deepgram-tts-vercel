export default async function handler(req, res) {
  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ success: false, message: 'Only GET requests are allowed' });
    }

    // Extract query parameters
    const { text, voice_id = 'emily', format = 'mp3' } = req.query;

    if (!text) {
      return res.status(400).json({ success: false, message: 'Text parameter is required' });
    }

    if (!process.env.WAVES_API_KEY) {
      return res.status(500).json({ success: false, message: 'Missing WAVES_API_KEY in environment' });
    }

    // Construct request body
    const requestBody = JSON.stringify({
      text,
      voice_id,
      format, // Ensure MP3 format
      sample_rate: 24000,
      speed: 1.0,
    });

    // Call Waves API
    const response = await fetch('https://waves-api.smallest.ai/api/v1/lightning/get_speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.WAVES_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Waves API Error:', errorText);
      return res.status(response.status).json({ success: false, message: 'Failed to fetch speech', details: errorText });
    }

    // Set headers to stream MP3 correctly
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'inline; filename="speech.mp3"');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Stream the response correctly for Vercel
    const reader = response.body.getReader();
    res.status(200);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }

    res.end();
  } catch (error) {
    console.error('Internal Server Error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
}
