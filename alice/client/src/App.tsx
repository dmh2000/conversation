import { useState, useCallback } from 'react';
import { useWebSocket } from './services/websocketClient';
import type { Message } from './services/websocketClient';
import { MessageDisplay } from './components/MessageDisplay';
import './App.css';

function App() {
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null);

  const handleMessage = useCallback((message: Message) => {
    console.log('Received message:', message);
    setCurrentMessage(message);
  }, []);

  const handleResetAck = useCallback(() => {
    window.location.reload();
  }, []);

  const { isConnected, sendReset } = useWebSocket(handleMessage, handleResetAck);

  const handleRestart = () => {
    sendReset();
  };

  return (
    <div >
      <header role="banner">
        <h1>Alice</h1>
        <div className="header-controls">
          <button
            className="restart-button"
            onClick={handleRestart}
            disabled={!isConnected}
            aria-label="Restart conversation"
            title="Restart conversation"
          >
            Restart
          </button>
          <div
            className={`status ${isConnected ? 'connected' : 'disconnected'}`}
            role="status"
            aria-live="polite"
            aria-label={isConnected ? 'Connected to server' : 'Disconnected from server'}
          >
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </header>

      <main role="main">
        <MessageDisplay text={currentMessage?.text || ''} />
      </main>
    </div>
  );
}

export default App;