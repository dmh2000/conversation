import { useEffect, useState } from 'react';

interface MessageDisplayProps {
  text: string;
}

export function MessageDisplay({ text }: MessageDisplayProps) {
  const [displayText, setDisplayText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (text && text !== displayText) {
      setIsAnimating(true);
      // Trigger animation
      const timer = setTimeout(() => {
        setDisplayText(text);
        setIsAnimating(false);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [text, displayText]);

  return (
    <div className="message-display" role="region" aria-label="Message display">
      <h2>Message:</h2>
      <p
        key={displayText}
        className={isAnimating ? 'animating' : ''}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {displayText}
      </p>
    </div>
  );
}
