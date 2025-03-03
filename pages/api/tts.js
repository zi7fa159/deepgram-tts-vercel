import { createClient } from '@deepgram/sdk';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { text } = req.query;
  if (!text) {
    return res.status(400).json({ success: false, message: 'Text parameter is required' });
  }

  try {
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
    const response = await deepgram.speak.request(
      { text },
      { model: 'aura-asteria-en' }
    );

    const audioBuffer = await response.getBuffer(); // Use getBuffer instead of getStream
    if (!audioBuffer) {
      throw new Error('Failed to generate audio buffer');
    }

    // Store the buffer globally (in-memory, ephemeral in serverless)
    global.latestAudioBuffer = audioBuffer;

    res.status(200).json({ success: true, url: '/speech.mp3' });
  } catch (error) {
    console.error('Error generating speech:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
}
