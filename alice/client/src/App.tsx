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
    setCurrentMessage(message);
  }, []);

  const { isConnected } = useWebSocket(handleMessage);

  if (!isStarted) {
    return (
      <div className="app start-screen">
        <h1>Alice</h1>
        <button onClick={() => setIsStarted(true)}>Start</button>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <h1>Alice</h1>
        <div className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      </header>

      <main>
        <MessageDisplay text={currentMessage?.text || ''} />
        <AudioPlayer audioPath={currentMessage?.audio || ''} />
      </main>
    </div>
  );
}

export default App;