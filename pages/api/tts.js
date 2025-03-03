import fs from 'fs';
import path from 'path';
import { generateFileName } from '../../../utils'; // Corrected import

export default async function handler(req, res) {
  console.log("Deepgram URL:", process.env.DEEPGRAM_TTS_API_URL);
  console.log("Deepgram API Key:", process.env.DEEPGRAM_API_KEY ? "Present" : "Missing");

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Only GET requests allowed" });
  }

  const { text, id, voice } = req.query;
  if (!text) {
    return res.status(400).json({ message: "No text provided" });
  }

  if (!process.env.DEEPGRAM_TTS_API_URL || !process.env.DEEPGRAM_API_KEY) {
    return res.status(500).json({ success: false, message: "Missing Deepgram API credentials" });
  }

  try {
    // Prepare payload with only text (as required by Deepgram)
    const payload = { text };

    const response = await fetch(process.env.DEEPGRAM_TTS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${process.env.DEEPGRAM_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Deepgram API Error:", errorText);
      return res.status(response.status).json({ success: false, message: errorText });
    }

    // Get the audio file data from Deepgram
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate a filename using the provided id (or session id) and current timestamp
    const filename = generateFileName(id);
    // Write the file to the /tmp directory (which is writable on Vercel)
    const filePath = path.join('/tmp', filename);
    fs.writeFileSync(filePath, buffer);

    // Return the URL for retrieving the file
    return res.status(200).json({ success: true, url: `/speech/${filename}` });
  } catch (error) {
    console.error("Fetch Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
