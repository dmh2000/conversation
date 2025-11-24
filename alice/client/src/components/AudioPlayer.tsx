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
    waveColor: '#00fff0',        // Neon cyan
    progressColor: '#ff006e',    // Hot magenta
    cursorColor: '#4d4dff',      // Neon blue
    barWidth: 3,
    barGap: 2,
    height: 250,                 // Massive waveform
    autoplay: true,
    barRadius: 2,
  });

  // Load new audio when audioPath changes
  useEffect(() => {
    if (!wavesurfer || !audioPath || audioPath.trim() === '') return;

    console.log('Loading audio:', audioPath);

    wavesurfer.load(audioPath);

    // Error handling
    const unsubError = wavesurfer.on('error', (err) => {
      console.error('WaveSurfer error:', err);
      console.error('Failed to load audio from:', audioPath);
    });

    // Ready event
    const unsubReady = wavesurfer.on('ready', () => {
      console.log('Audio ready, attempting autoplay...');
      wavesurfer.play().catch((e) => {
        console.error('Autoplay failed:', e);
        console.log('User must click play button due to browser autoplay policy');
      });
    });

    return () => {
      unsubError();
      unsubReady();
    };
  }, [wavesurfer, audioPath]);

  return (
    <div className="audio-player" role="region" aria-label="Audio player">
      <h2>Audio:</h2>
      {audioPath ? (
        <div style={{ width: '100%' }} aria-label="Audio waveform visualization">
          <div ref={containerRef} style={{ width: '100%' }} role="application" aria-label="Audio playback controls" />
        </div>
      ) : (
        <p role="status">No audio to play</p>
      )}
    </div>
  );
}
