interface MessageDisplayProps {
  text: string;
}

export function MessageDisplay({ text }: MessageDisplayProps) {
  return (
    <div className="message-display">
      <h2>Message:</h2>
      <p>{text || 'Waiting for messages...'}</p>
    </div>
  );
}
