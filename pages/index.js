import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [audioUrl, setAudioUrl] = useState('/speech/default.mp3');
  const [sessionId, setSessionId] = useState('');
  const [voices] = useState(['asteria', 'nova', 'stella', 'luna']);
  const [selectedVoice, setSelectedVoice] = useState('asteria');
  const audioRef = useRef(null);

  // Generate a unique session ID when the component mounts
  useEffect(() => {
    // Create a simple random ID
    const newSessionId = `user_${Math.random().toString(36).substring(2, 10)}`;
    setSessionId(newSessionId);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim()) {
      setError('Please enter some text');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call the TTS API with the session ID to keep track of user files
      const response = await fetch(`/api/tts?text=${encodeURIComponent(text)}&id=${sessionId}&voice=${selectedVoice}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to generate speech');
      }

      // Update the audio URL
      const newAudioUrl = `${data.url}?t=${Date.now()}`;
      setAudioUrl(newAudioUrl);

      // Force the audio element to reload with new content
      if (audioRef.current) {
        audioRef.current.src = newAudioUrl;
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
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
      <h1>Deepgram Text-to-Speech</h1>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="voice-select" style={{ display: 'block', marginBottom: '5px' }}>
            Voice:
          </label>
          <select 
            id="voice-select"
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px',
              marginBottom: '15px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          >
            {voices.map(voice => (
              <option key={voice} value={voice}>
                {voice.charAt(0).toUpperCase() + voice.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="text-input" style={{ display: 'block', marginBottom: '5px' }}>
            Text:
          </label>
          <textarea
            id="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to convert to speech..."
            rows={5}
            style={{ 
              width: '100%', 
              padding: '10px', 
              marginBottom: '15px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
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
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {isLoading ? 'Generating...' : 'Generate Speech'}
        </button>
      </form>
      
      {error && (
        <div style={{ 
          color: 'white', 
          backgroundColor: '#f44336',
          padding: '10px', 
          borderRadius: '4px',
          marginTop: '15px' 
        }}>
          Error: {error}
        </div>
      )}
      
      <div style={{ marginTop: '25px' }}>
        <h2>Audio Output</h2>
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#f5f5f5',
          borderRadius: '4px' 
        }}>
          <audio 
            ref={audioRef} 
            controls 
            style={{ width: '100%' }}
          >
            <source src={audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
          
          <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            <p>Your session ID: <code>{sessionId}</code></p>
            <p>Audio URL: <code>{audioUrl}</code></p>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '25px' }}>
        <h2>API Usage</h2>
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          fontFamily: 'monospace'
        }}>
          <p><strong>Generate speech:</strong></p>
          <code>/api/tts?text=Your text here&id=your_file_id&voice=asteria</code>
          
          <p style={{ marginTop: '10px' }}><strong>Get audio file:</strong></p>
          <code>/speech/your_file_id.mp3</code>
        </div>
      </div>
    </div>
  );
}
