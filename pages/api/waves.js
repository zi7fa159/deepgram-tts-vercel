export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Only GET requests allowed' });
  }

  const { text } = req.query;
  if (!text) {
    return res.status(400).json({ message: 'No text provided' });
  }

  if (!process.env.WAVES_TTS_API_URL || !process.env.WAVES_API_KEY) {
    console.error('❌ Missing WAVES API credentials');
    return res.status(500).json({ success: false, message: 'Missing Waves API credentials' });
  }

  console.log('🟢 Sending request to Waves API...');
  console.log('🌍 URL:', process.env.WAVES_TTS_API_URL);
  console.log('🔑 API Key:', process.env.WAVES_API_KEY ? 'Present' : 'Missing');
  console.log('📝 Text:', text);

  try {
    const response = await fetch(process.env.WAVES_TTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WAVES_API_KEY}`
      },
      body: JSON.stringify({ text })
    });

    console.log('🔄 Waves API Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Waves API Error:', errorText);
      return res.status(response.status).json({ success: false, message: errorText });
    }

    console.log('✅ Received Audio Data');
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'attachment; filename="waves_tts.mp3"');
    res.setHeader('Content-Length', buffer.length);

    return res.status(200).send(buffer);
  } catch (error) {
    console.error('🚨 Fetch Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
