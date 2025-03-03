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
    // Create Deepgram client
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
    
    // Based on Deepgram SDK v3.0.0 documentation
    const options = {
      text: text,
      voice: 'asteria', // Default voice
      encoding: 'mp3'   // Request MP3 format
    };
    
    // Log what we're sending to Deepgram
    console.log('Sending to Deepgram:', options);
    
    // Use raw fetch for more control over the request
    const response = await fetch('https://api.deepgram.com/v1/speak', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(options)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Deepgram API error: ${response.status} ${errorData.message || response.statusText}`);
    }
    
    // Get the audio as a buffer
    const audioArrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(audioArrayBuffer);
    
    console.log(`Received ${audioBuffer.length} bytes of audio from Deepgram`);
    
    if (audioBuffer.length === 0) {
      throw new Error('Empty audio buffer received from Deepgram');
    }
    
    // Save the buffer to a file
    const saved = saveAudioFile(audioBuffer);
    if (!saved) {
      throw new Error('Failed to save audio file');
    }
    
    console.log('Audio file saved successfully');

    res.status(200).json({ 
      success: true, 
      url: '/speech.mp3',
      message: 'Speech generated and saved successfully',
      size: audioBuffer.length
    });
  } catch (error) {
    console.error('Error generating speech:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: error.message || String(error)
    });
  }
}
