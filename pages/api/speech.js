import { createClient } from '@deepgram/sdk';
import Redis from 'ioredis';

export default async function handler(req, res) {
  try {
    const redis = new Redis(process.env.REDIS_URL);
    const text = await redis.get('latest_text');
    await redis.quit();

    if (!text) {
      return res.status(404).json({ success: false, message: 'No text available' });
    }

    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
    const response = await deepgram.speak.request(
      { text },
      { model: 'aura-asteria-en' }
    );

    const stream = await response.getStream();
    if (!stream) {
      throw new Error('Failed to generate audio stream');
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    stream.pipe(res);
  } catch (error) {
    console.error('Error generating speech:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
