import { useState, useEffect, useRef } from 'react';
import './App.css';
import { AudioPlayer } from './components/AudioPlayer';

interface Message {
  text: string;
  audio: string;
}

function App() {
  const [message, setMessage] = useState<string>('Waiting for message...');
  const [isStarted, setIsStarted] = useState(false);
  const [inputText, setInputText] = useState('');
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
      try {
        const receivedMessage: Message = JSON.parse(event.data);
        setMessage(receivedMessage.text);
        setCurrentAudio(receivedMessage.audio || null); // Set audio URL or null
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    // Calculate word count
    const words = text.trim() === '' ? [] : text.trim().split(/\s+/);
    
    // Only update if within limit (or if deleting/shortening)
    // Allowing user to type spaces is important, so we check word count of trimmed text
    if (words.length <= 256) {
        setInputText(text);
        // Auto-expand
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }
  };

  const handleGoAskAlice = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        // Send the contents of the text area to the websocket server
        wsRef.current.send(JSON.stringify({ text: inputText }));
    }
    setIsStarted(true);
  };

  return (
    <div className="App">
      <header className="App-header">
        {!isStarted ? (
          <div className="initial-input-container">
            <h1>Bob</h1>
            <textarea
                ref={textareaRef}
                value={inputText}
                onChange={handleInputChange}
                placeholder="Enter your text here (max 256 words)..."
                style={{ 
                    width: '80%', 
                    minHeight: '100px', 
                    padding: '15px',
                    fontSize: '1.2rem',
                    resize: 'none',
                    overflow: 'hidden',
                    borderRadius: '10px',
                    border: '2px solid #61dafb',
                    backgroundColor: '#20232a',
                    color: 'white',
                    outline: 'none'
                }}
            />
            <button 
                onClick={handleGoAskAlice}
                disabled={!inputText.trim()}
                className="go-ask-alice-button"
            >
                Go Ask Alice
            </button>
          </div>
        ) : (
          <>
            <h1>Bob</h1>
            <p className="message">{message}</p>
            <AudioPlayer audioPath={currentAudio || ''} />
          </>
        )}
      </header>
    </div>
  );
}

export default App;
