import { spawn } from 'child_process';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Only GET requests are allowed' });
  }

  const { text, voice_id = 'emily', sample_rate = 24000, speed = 1.0 } = req.query;

  if (!text) {
    return res.status(400).json({ success: false, message: 'Text is required' });
  }

  if (!process.env.WAVES_API_KEY) {
    return res.status(500).json({ success: false, message: 'WAVES_API_KEY is not set' });
  }

  const requestBody = {
    text,
    voice_id,
    sample_rate: parseInt(sample_rate),
    speed: parseFloat(speed),
  };

  try {
    const response = await fetch('https://waves-api.smallest.ai/api/v1/lightning/get_speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.WAVES_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Waves API Error:', errorText);
      return res.status(response.status).json({ success: false, message: errorText });
    }

    const arrayBuffer = await response.arrayBuffer();
    const wavBuffer = Buffer.from(arrayBuffer);

    // Convert WAV to MP3 using FFmpeg
    const ffmpeg = spawn('ffmpeg', ['-i', 'pipe:0', '-f', 'mp3', 'pipe:1']);
    ffmpeg.stdin.write(wavBuffer);
    ffmpeg.stdin.end();

    let mp3Buffer = Buffer.alloc(0);
    ffmpeg.stdout.on('data', (chunk) => {
      mp3Buffer = Buffer.concat([mp3Buffer, chunk]);
    });

    ffmpeg.stderr.on('data', (data) => {
      console.error(`FFmpeg error: ${data}`);
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Disposition', 'attachment; filename="speech.mp3"');
        res.setHeader('Content-Length', mp3Buffer.length);
        res.status(200).send(mp3Buffer);
      } else {
        res.status(500).json({ success: false, message: 'FFmpeg conversion failed' });
      }
    });
  } catch (error) {
    console.error('Fetch Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
