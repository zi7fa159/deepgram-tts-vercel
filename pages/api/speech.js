export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  if (!global.latestAudioBuffer) {
    return res.status(404).json({ success: false, message: 'No audio generated yet' });
  }

  res.setHeader('Content-Type', 'audio/mpeg');
  res.send(global.latestAudioBuffer);
}
