// utils.js
export function generateFileName(id) {
  const timestamp = Date.now();
  return `${id || "speech"}_${timestamp}.mp3`;
}
