import { useState, useRef } from 'react';

export default function Home() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim()) {
      setError('Please enter some text');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call the TTS API
      const response = await fetch(`/api/tts?text=${encodeURIComponent(text)}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to generate speech');
      }

      // Force the audio element to reload with new content
      if (audioRef.current) {
        audioRef.current.src = `${data.url}?t=${Date.now()}`;
        audioRef.current.load();
        audioRef.current.play();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>Text-to-Speech Demo</h1>
      
      <form onSubmit={handleSubmit}>
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to convert to speech..."
            rows={5}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          style={{ 
            padding: '10px 15px', 
            backgroundColor: '#4CAF50', 
            color: 'white',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Generating...' : 'Generate Speech'}
        </button>
      </form>
      
      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          Error: {error}
        </div>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <h2>Audio Output</h2>
        <audio 
          ref={audioRef} 
          controls 
          style={{ width: '100%' }}
        >
          <source src="/speech.mp3" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h2>API Usage</h2>
        <p>To generate speech, make a GET request to:</p>
        <code>/api/tts?text=Your text here</code>
        <p>To get the generated audio file:</p>
        <code>/speech.mp3</code>
      </div>
    </div>
  );
}
