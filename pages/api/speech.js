import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  // Extract the filename from the URL.
  const parts = req.url.split('/');
  const file = parts.pop() || parts.pop(); // handles potential trailing slash
  const filePath = path.join('/tmp', file);

  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'audio/mpeg');
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } else {
    res.status(404).json({ message: 'Audio file not found' });
  }
}
