import { createClient } from '@deepgram/sdk';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { text } = req.query;
  if (!text) {
    return res.status(400).json({ message: 'Text parameter is required' });
  }

  try {
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
    const response = await deepgram.speak.request(
      { text },
      { model: 'aura-asteria-en' } // Adjust voice model as needed
    );

    const stream = await response.getStream();
    if (!stream) {
      throw new Error('Failed to generate audio stream');
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    stream.pipe(res);
  } catch (error) {
    console.error('Error generating speech:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
