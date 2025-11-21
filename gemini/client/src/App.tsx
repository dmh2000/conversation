import { useState, useEffect } from 'react';
import './App.css';

interface Message {
  text: string;
  audio: string;
}

function App() {
  const [message, setMessage] = useState<string>('Waiting for message...');

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000');

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
      try {
        const receivedMessage: Message = JSON.parse(event.data);
        setMessage(receivedMessage.text);
        
        if (receivedMessage.audio) {
          const audio = new Audio(receivedMessage.audio);
          audio.play().catch(e => console.error("Audio playback failed:", e));
        }
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
      setMessage('Connection lost. Please refresh.');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setMessage('Connection error.');
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Real-time Message Display</h1>
        <p className="message">{message}</p>
      </header>
    </div>
  );
}

export default App;