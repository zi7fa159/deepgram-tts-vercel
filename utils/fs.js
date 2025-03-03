import fs from 'fs';
import path from 'path';
import os from 'os';

// Define a consistent location for the audio file
// Using /tmp directory which is writable in serverless environments
const AUDIO_FILE_PATH = path.join(os.tmpdir(), 'speech.mp3');

// Function to save buffer to file
export const saveAudioFile = (buffer) => {
  try {
    fs.writeFileSync(AUDIO_FILE_PATH, buffer);
    return true;
  } catch (error) {
    console.error('Error saving audio file:', error);
    return false;
  }
};

// Function to read audio file
export const getAudioFile = () => {
  try {
    if (fs.existsSync(AUDIO_FILE_PATH)) {
      return fs.readFileSync(AUDIO_FILE_PATH);
    }
    return null;
  } catch (error) {
    console.error('Error reading audio file:', error);
    return null;
  }
};

// Check if audio file exists
export const audioFileExists = () => {
  return fs.existsSync(AUDIO_FILE_PATH);
};
