import { createClient } from '@deepgram/sdk';
import { saveAudioFile } from '../../utils/fs';

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

    const audioBuffer = await response.getBuffer();
    if (!audioBuffer) {
      throw new Error('Failed to generate audio buffer');
    }

    // Save the buffer to a file
    const saved = saveAudioFile(audioBuffer);
    if (!saved) {
      throw new Error('Failed to save audio file');
    }

    res.status(200).json({ 
      success: true, 
      url: '/speech.mp3',
      message: 'Speech generated and saved successfully'
    });
  } catch (error) {
    console.error('Error generating speech:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
}
