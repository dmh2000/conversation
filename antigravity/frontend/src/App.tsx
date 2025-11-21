import { useEffect, useRef, useState } from 'react';
import './App.css';
import { useWebSocket } from './hooks/useWebSocket';
import { MessageDisplay } from './components/MessageDisplay';

function App() {
  const { message, isConnected } = useWebSocket('ws://localhost:3000');
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);

  useEffect(() => {
    if (message && message.audio) {
      if (audioRef.current) {
        audioRef.current.src = message.audio;
        audioRef.current.play().catch((e) => {
          console.error("Error playing audio:", e);
        });
      }
    }
  }, [message]);

  const enableAudio = () => {
    setAudioEnabled(true);
    // Play a silent sound or just resume context if needed
    if (audioRef.current) {
      audioRef.current.play().catch(() => { });
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>Antigravity Receiver</h1>
        <div className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </header>

      <main>
        {!audioEnabled && (
          <button onClick={enableAudio} className="enable-audio-btn">
            Enable Audio Playback
          </button>
        )}

        {message ? (
          <MessageDisplay text={message.text} />
        ) : (
          <p className="waiting">Waiting for messages...</p>
        )}

        <audio ref={audioRef} style={{ display: 'none' }} />
      </main>
    </div>
  );
}

export default App;
