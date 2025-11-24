import { useState, useCallback } from 'react';
import { useWebSocket } from './services/websocketClient';
import type { Message } from './services/websocketClient';
import { MessageDisplay } from './components/MessageDisplay';
import { AudioPlayer } from './components/AudioPlayer';
import './App.css';

function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null);

  const handleMessage = useCallback((message: Message) => {
    console.log('Received message:', message);
    // Prepend server origin to audio path if it's relative
    if (message.audio && message.audio.startsWith('/')) {
      // Assuming server is on localhost:3000 for dev
      message.audio = `http://localhost:3000${message.audio}`;
      console.log('Converted audio path to:', message.audio);
    }
    setCurrentMessage(message);
  }, []);

  const { isConnected } = useWebSocket(handleMessage);

  if (!isStarted) {
    return (
      <div className="app start-screen" role="main">
        <h1>Alice</h1>
        <button
          onClick={() => setIsStarted(true)}
          aria-label="Start Alice messaging interface"
        >
          Start
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <header role="banner">
        <h1>Alice</h1>
        <div
          className={`status ${isConnected ? 'connected' : 'disconnected'}`}
          role="status"
          aria-live="polite"
          aria-label={isConnected ? 'Connected to server' : 'Disconnected from server'}
        >
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </header>

      <main role="main">
        <MessageDisplay text={currentMessage?.text || ''} />
        <AudioPlayer audioPath={currentMessage?.audio || ''} />
      </main>
    </div>
  );
}

export default App;