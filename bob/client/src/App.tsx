import { useState, useRef, useMemo, useCallback } from 'react';
import './App.css';
import { useWebSocket } from './services/websocketClient';
import type { Message } from './services/websocketClient';

function App() {
  const [message, setMessage] = useState<string>('');
  const [isStarted, setIsStarted] = useState(false);
  const [inputText, setInputText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleMessage = useCallback((receivedMessage: Message) => {
    console.log('Received message:', receivedMessage);
    setMessage(receivedMessage.text);
  }, []);

  const { isConnected, send } = useWebSocket(handleMessage);

  // Calculate word count
  const wordCount = useMemo(() => {
    if (inputText.trim() === '') return 0;
    return inputText.trim().split(/\s+/).length;
  }, [inputText]);

  const isNearLimit = wordCount >= 230; // Highlight when near 256 word limit

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
    send({ text: inputText });
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
