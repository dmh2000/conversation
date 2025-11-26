import { useState, useEffect, useRef, useMemo } from 'react';
import './App.css';
import { AudioPlayer } from './components/AudioPlayer';

interface Message {
  text: string;
  audio: string;
}

function App() {
  const [message, setMessage] = useState<string>('');
  const [isStarted, setIsStarted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [inputText, setInputText] = useState('');
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Calculate word count
  const wordCount = useMemo(() => {
    if (inputText.trim() === '') return 0;
    return inputText.trim().split(/\s+/).length;
  }, [inputText]);

  const isNearLimit = wordCount >= 230; // Highlight when near 256 word limit

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3002');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const receivedMessage: Message = JSON.parse(event.data);
        setMessage(receivedMessage.text);
        setCurrentAudio(receivedMessage.audio || null);
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
      setMessage('Connection lost. Please refresh.');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
      setMessage('Connection error.');
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const words = text.trim() === '' ? [] : text.trim().split(/\s+/);

    if (words.length <= 256) {
      setInputText(text);
      // Auto-expand textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      }
    }
  };

  const handleGoAskAlice = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text: inputText }));
    }
    setIsStarted(true);
  };

  if (!isStarted) {
    return (
      <div className="App">
        <header className="App-header">
          <div className="initial-input-container">
            <h1>Bob</h1>
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={handleInputChange}
              placeholder="Compose your thoughts..."
              aria-label="Message composition area"
              aria-describedby="word-count"
            />
            <div
              id="word-count"
              className={`word-counter ${isNearLimit ? 'near-limit' : ''}`}
              role="status"
              aria-live="polite"
            >
              {wordCount} / 256 words
            </div>
            <button
              onClick={handleGoAskAlice}
              disabled={!inputText.trim()}
              className="go-ask-alice-button"
              aria-label={inputText.trim() ? 'Send message to Alice' : 'Please enter a message first'}
            >
              Go Ask Alice
            </button>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="message-header" role="banner">
        <h1>Bob</h1>
        <div
          className={`connection-status ${isConnected ? 'connected' : ''}`}
          role="status"
          aria-live="polite"
          aria-label={isConnected ? 'Connected to server' : 'Disconnected from server'}
        >
          <span className="status-dot" aria-hidden="true"></span>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </header>

      <main className="message-content" role="main">
        {message ? (
          <>
            <p
              className="message"
              role="region"
              aria-label="Received message"
              aria-live="polite"
            >
              {message}
            </p>
            <div className="message-divider" aria-hidden="true"></div>
            <AudioPlayer audioPath={currentAudio || ''} />
          </>
        ) : (
          <p
            className="message"
            role="status"
            aria-live="polite"
          >
            Awaiting response...
          </p>
        )}
      </main>
    </div>
  );
}

export default App;
