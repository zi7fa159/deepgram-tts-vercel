import path from 'path';
import fs from 'fs';

export default function handler(req, res) {
  // For simplicity, always return the default speech MP3 file.
  // In a full implementation, you would retrieve the generated file based on the id.
  const filePath = path.join(process.cwd(), 'public', 'speech', 'default.mp3');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'audio/mpeg');
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } else {
    res.status(404).json({ message: 'Audio file not found' });
  }
}
