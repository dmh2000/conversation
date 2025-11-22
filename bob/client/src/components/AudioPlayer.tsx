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
    waveColor: '#41D1FF',
    progressColor: '#BD34FE',
    cursorColor: '#ffffff',
    barWidth: 2,
    barGap: 3,
    height: 100,
    autoplay: true,
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
    <div className="audio-player">
      <h2>Audio:</h2>
      {audioPath ? (
        <div style={{ width: '100%' }}>
          <div ref={containerRef} style={{ width: '100%' }} />
        </div>
      ) : (
        <p>No audio to play</p>
      )}
    </div>
  );
}
