import fs from 'fs';
import path from 'path';
import os from 'os';

// Define a consistent location for audio files
// Using a dedicated directory in the tmp folder for better organization
const AUDIO_DIR = path.join(os.tmpdir(), 'tts-audio');

// Ensure the directory exists
try {
  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
    console.log(`Created audio directory at ${AUDIO_DIR}`);
  }
} catch (error) {
  console.error('Error creating audio directory:', error);
}

// Function to save buffer to file
export const saveAudioFile = (buffer, fileName = 'default') => {
  try {
    // Sanitize the filename - only allow alphanumeric chars and common symbols
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filePath = path.join(AUDIO_DIR, `${sanitizedFileName}.mp3`);
    
    fs.writeFileSync(filePath, buffer);
    console.log(`Audio saved to ${filePath}`);
    return true;
  } catch (error) {
    console.error('Error saving audio file:', error);
    return false;
  }
};

// Function to read audio file
export const getAudioFile = (fileName = 'default') => {
  try {
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filePath = path.join(AUDIO_DIR, `${sanitizedFileName}.mp3`);
    
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath);
    }
    
    console.log(`Audio file not found: ${filePath}`);
    return null;
  } catch (error) {
    console.error('Error reading audio file:', error);
    return null;
  }
};

// Check if audio file exists
export const audioFileExists = (fileName = 'default') => {
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9-_]/g, '_');
  const filePath = path.join(AUDIO_DIR, `${sanitizedFileName}.mp3`);
  return fs.existsSync(filePath);
};

// Get all available audio files
export const getAllAudioFiles = () => {
  try {
    const files = fs.readdirSync(AUDIO_DIR);
    return files.filter(file => file.endsWith('.mp3'));
  } catch (error) {
    console.error('Error listing audio files:', error);
    return [];
  }
};

// Delete an audio file
export const deleteAudioFile = (fileName) => {
  try {
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filePath = path.join(AUDIO_DIR, `${sanitizedFileName}.mp3`);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting audio file:', error);
    return false;
  }
};
