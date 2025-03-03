import Redis from 'ioredis';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { text } = req.query;
  if (!text) {
    return res.status(400).json({ success: false, message: 'Text parameter is required' });
  }

  try {
    const redis = new Redis(process.env.REDIS_URL);
    await redis.set('latest_text', text);
    await redis.quit();
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error storing text:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
