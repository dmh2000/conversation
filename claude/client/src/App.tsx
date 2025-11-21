import { useState, useCallback } from 'react';
import { useWebSocket, Message } from './services/websocketClient';
import { MessageDisplay } from './components/MessageDisplay';
import { AudioPlayer } from './components/AudioPlayer';
import './App.css';

function App() {
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null);

  const handleMessage = useCallback((message: Message) => {
    setCurrentMessage(message);
  }, []);

  const { isConnected } = useWebSocket(handleMessage);

  return (
    <div className="app">
      <header>
        <h1>WebSocket Messaging App</h1>
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
