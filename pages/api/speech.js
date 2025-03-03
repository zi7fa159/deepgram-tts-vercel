import { getAudioFile, audioFileExists } from '../../utils/fs';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // Check if audio file exists
  if (!audioFileExists()) {
    return res.status(404).json({ 
      success: false, 
      message: 'No audio file found. Generate speech first using the /api/tts endpoint.' 
    });
  }

  // Get the audio file
  const audioBuffer = getAudioFile();
  if (!audioBuffer) {
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to read audio file' 
    });
  }

  // Set headers and return the audio
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Content-Length', audioBuffer.length);
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  res.send(audioBuffer);
}
