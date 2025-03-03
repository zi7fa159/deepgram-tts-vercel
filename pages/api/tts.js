import { createClient } from '@deepgram/sdk';
import { saveAudioFile } from '../../utils/fs';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // Get text from query params (GET) or request body (POST)
  let text = '';
  let fileName = 'default';
  
  if (req.method === 'GET') {
    text = req.query.text;
    fileName = req.query.id || 'default';
  } else {
    // For POST requests, get from body
    const body = req.body;
    text = body.text;
    fileName = body.id || 'default';
  }

  if (!text) {
    return res.status(400).json({ success: false, message: 'Text parameter is required' });
  }

  try {
    // Create Deepgram client with API key
    if (!process.env.DEEPGRAM_API_KEY) {
      throw new Error('DEEPGRAM_API_KEY is not configured');
    }
    
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
    
    // TTS request options
    const options = {
      text: text,
      voice: req.query.voice || req.body?.voice || 'asteria', // Allow voice customization
      encoding: 'mp3'
    };
    
    console.log('Sending to Deepgram:', options);
    
    // Updated to use SDK properly
    try {
      const response = await fetch('https://api.deepgram.com/v1/speak', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(options)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Deepgram API error: ${response.status} ${response.statusText}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage += ` - ${errorData.error || errorData.message || errorText}`;
        } catch (e) {
          errorMessage += ` - ${errorText || 'No additional error details'}`;
        }
        throw new Error(errorMessage);
      }
      
      // Get the audio as a buffer
      const audioArrayBuffer = await response.arrayBuffer();
      const audioBuffer = Buffer.from(audioArrayBuffer);
      
      console.log(`Received ${audioBuffer.length} bytes of audio from Deepgram`);
      
      if (audioBuffer.length === 0) {
        throw new Error('Empty audio buffer received from Deepgram');
      }
      
      // Save the buffer to a file with the specified name
      const saved = saveAudioFile(audioBuffer, fileName);
      if (!saved) {
        throw new Error('Failed to save audio file');
      }
      
      console.log(`Audio file saved successfully as ${fileName}.mp3`);

      res.status(200).json({ 
        success: true, 
        url: `/speech/${fileName}.mp3`,
        message: 'Speech generated and saved successfully',
        size: audioBuffer.length,
        fileName: `${fileName}.mp3`
      });
    } catch (deepgramError) {
      console.error('Deepgram API error:', deepgramError);
      throw new Error(`Deepgram API error: ${deepgramError.message || deepgramError}`);
    }
  } catch (error) {
    console.error('Error generating speech:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: error.message || String(error)
    });
  }
}
