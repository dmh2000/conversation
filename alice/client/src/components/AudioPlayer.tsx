import { useEffect, useRef } from 'react';
import { useWavesurfer } from '@wavesurfer/react';

interface AudioPlayerProps {
  audioPath: string;
}

export function AudioPlayer({ audioPath }: AudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { wavesurfer } = useWavesurfer({
    container: containerRef,
    url: audioPath || undefined,
    waveColor: '#7a9b8e',        // Sage green (--color-sage)
    progressColor: '#c45e3f',    // Terracotta (--color-terracotta)
    cursorColor: '#b8956a',      // Gold (--color-gold)
    barWidth: 2,
    barGap: 4,
    height: 180,                 // Editorial height
    autoplay: true,
    barRadius: 2,
  });

  useEffect(() => {
    if (!wavesurfer) return;

    // Error handling
    const unsubError = wavesurfer.on('error', (err) => {
      console.error('WaveSurfer error:', err);
    });

    // Ready event
    const unsubReady = wavesurfer.on('ready', () => {
      console.log('Audio ready');
    });

    return () => {
      unsubError();
      unsubReady();
    };
  }, [wavesurfer]);

  return (
    <div className="audio-player" role="region" aria-label="Audio player">
      <h2>Audio Response</h2>
      {audioPath ? (
        <div aria-label="Audio waveform visualization">
          <div
            ref={containerRef}
            style={{ width: '100%' }}
            role="application"
            aria-label="Audio playback controls"
          />
        </div>
      ) : (
        <p role="status">No audio available</p>
      )}
    </div>
  );
}
