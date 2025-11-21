import { useEffect, useRef } from 'react';

interface AudioPlayerProps {
  audioPath: string;
}

export function AudioPlayer({ audioPath }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioPath && audioRef.current) {
      const audio = audioRef.current;

      // Load and play the new audio file
      audio.src = audioPath;
      audio.load();

      audio.play().catch((error) => {
        console.error('Failed to play audio:', error);
      });
    }
  }, [audioPath]);

  return (
    <div className="audio-player">
      <h2>Audio:</h2>
      {audioPath ? (
        <audio ref={audioRef} controls>
          <source src={audioPath} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      ) : (
        <p>No audio to play</p>
      )}
    </div>
  );
}
