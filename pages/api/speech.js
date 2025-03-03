import { getAudioFile, audioFileExists } from '../../../utils/fs';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { fileName } = req.query;
  
  if (!fileName) {
    return res.status(400).json({ 
      success: false, 
      message: 'File name is required' 
    });
  }

  // Remove the .mp3 extension if present
  const baseFileName = fileName.endsWith('.mp3') 
    ? fileName.slice(0, -4) 
    : fileName;

  // Check if audio file exists
  if (!audioFileExists(baseFileName)) {
    return res.status(404).json({ 
      success: false, 
      message: `Audio file "${baseFileName}.mp3" not found. Generate speech first using the /api/tts endpoint.` 
    });
  }

  // Get the audio file
  const audioBuffer = getAudioFile(baseFileName);
  if (!audioBuffer) {
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to read audio file' 
    });
  }

  // Set headers and return the audio
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Content-Length', audioBuffer.length);
  res.setHeader('Content-Disposition', `inline; filename="${baseFileName}.mp3"`);
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  res.send(audioBuffer);
}
