# Audio Utils - TypeScript/Node.js

TypeScript/Node.js port of the Python `audio_utils.py` module for text-to-speech and audio playback.

## Features

- Generate speech from text using Google Gemini TTS API (gemini-2.5-flash-preview-tts model)
- Generate speech from text using ElevenLabs TTS API (44.1kHz MP3 output)
- Automatic 2-second pause added after speech for both APIs
- Convert PCM audio data to WAV and MP3 formats
- Play audio files using ffplay

## Prerequisites

- Node.js 16+ installed
- ffmpeg and ffplay installed on your system
- API keys for Google Gemini and/or ElevenLabs

### Dependencies

The module uses the following NPM packages:
- `@google/genai` (v1.30.0+) - Google Gemini API client
- `elevenlabs` (v1.59.0+) - ElevenLabs TTS client
- `dotenv` - Environment variable management

## Installation

```bash
cd tts
npm install
```

## Environment Variables

Create a `.env` file in the `tts/` directory with your API keys. You can copy the example file:

```bash
cp .env.example .env
```

Then edit `.env` with your actual API keys:

```env
GOOGLE_API_KEY=your_google_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=EXAVITQu4vr4xnSDxMaL  # Optional, defaults to Sarah voice
```

## Quick Test

Run the test program to verify both TTS APIs are working:

```bash
npm test
```

This will:
1. Generate speech using Google Gemini TTS
2. Generate speech using ElevenLabs TTS
3. Play both audio files
4. Create `test_gemini.mp3` and `test_elevenlabs.mp3` in the current directory

## Usage

### Import the module

```typescript
import {
  speak,
  speak11,
  playMp3,
  playWave,
  waveFile,
  pcmToMp3
} from './audio_utils';
```

### Generate speech with Google Gemini

```typescript
// Generate speech and save as MP3
// Note: Voice parameter currently not used - hardcoded to 'Kore' voice
const audioFile = await speak('Kore', 'Hello, world!', 'output');
console.log(`Audio saved to: ${audioFile}`);

// Text is automatically modified to add a 2-second pause after speaking
```

### Generate speech with ElevenLabs

```typescript
// Generate speech and save as MP3
// Uses mp3_44100_128 format (44.1kHz, 128kbps)
const audioFile = await speak11('voice_id_here', 'Hello, world!', 'output');
if (audioFile) {
  console.log(`Audio saved to: ${audioFile}`);
}

// Text is automatically modified to add a 2-second SSML break after speaking
```

### Play audio files

```typescript
// Play MP3 file
await playMp3('output.mp3');

// Play WAV file
await playWave('output.wav');
```

### Convert PCM to MP3

```typescript
// Convert PCM buffer to MP3
const pcmBuffer = Buffer.from(/* your PCM data */);
await pcmToMp3(pcmBuffer, 'output.mp3', 1, 2, 24000);
```

### Create WAV file from PCM

```typescript
// Save PCM data as WAV file
const pcmBuffer = Buffer.from(/* your PCM data */);
waveFile('output.wav', pcmBuffer, 1, 24000, 2);
```

## API Reference

### `speak(voice: string, text: string, filename: string): Promise<string>`

Generate speech using Google Gemini TTS API (gemini-2.5-flash-preview-tts model).

- **voice**: Voice name parameter (currently not used - voice is hardcoded to 'Kore')
  - Available Gemini voices: Puck, Charon, Kore, Fenrir, Aoede
- **text**: Text to convert to speech (automatically appends "wait 2 seconds after speaking")
- **filename**: Base filename for the output MP3 file (without extension)
- **Returns**: Path to the generated MP3 file
- **Note**: Includes automatic retry logic (up to 3 attempts) for transient errors

### `speak11(voice: string, text: string, filename: string): Promise<string | null>`

Generate speech using ElevenLabs TTS API.

- **voice**: ElevenLabs voice ID
- **text**: Text to convert to speech (automatically prepends quote and appends SSML 2-second break)
- **filename**: Path where the MP3 file will be saved (without extension)
- **Returns**: Path to the MP3 file, or null on error
- **Output format**: MP3 at 44.1kHz sample rate with 128kbps bitrate (mp3_44100_128)

### `playMp3(mp3File: string): Promise<void>`

Play MP3 audio file using ffplay.

- **mp3File**: Path to the MP3 file to play

### `playWave(wavFile: string): Promise<void>`

Play WAV audio file using ffplay.

- **wavFile**: Path to the WAV file to play

### `pcmToMp3(pcmData: Buffer, outputFilename: string, channels?: number, sampleWidth?: number, frameRate?: number): Promise<string>`

Convert PCM audio data to MP3 format.

- **pcmData**: Raw PCM audio data (Buffer)
- **outputFilename**: Path to save the MP3 file
- **channels**: Number of audio channels (default: 1 for mono)
- **sampleWidth**: Sample width in bytes (default: 2 for 16-bit)
- **frameRate**: Sample rate in Hz (default: 24000)
- **Returns**: Path to the created MP3 file

### `waveFile(filename: string, pcm: Buffer, channels?: number, rate?: number, sampleWidth?: number): void`

Save PCM audio data to a WAV file.

- **filename**: Path where the WAV file will be saved
- **pcm**: Raw PCM audio data (Buffer)
- **channels**: Number of audio channels (default: 1 for mono)
- **rate**: Sample rate in Hz (default: 24000)
- **sampleWidth**: Sample width in bytes (default: 2 for 16-bit)

## Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

Output will be in the `dist/` directory.

## Test

The `test_audio.ts` program demonstrates both TTS engines. Run it with:

```bash
npm test
```

The test program will:
- Test Google Gemini TTS with the "Kore" voice using test phrase for Gemini
- Test ElevenLabs TTS with the configured voice ID (defaults to Sarah) using test phrase for ElevenLabs
- Generate `test_gemini.mp3` and `test_elevenlabs.mp3` files
- Automatically play both MP3 files in sequence
- Display progress with checkmarks (✓) for success or crosses (✗) for failures
- Show detailed error messages if API keys are missing or requests fail

Requires valid API keys in `.env` file. Each API is tested independently, so one can succeed even if the other fails.

## Known Issues

1. **Google Gemini Voice Selection**: The `voice` parameter in the `speak()` function is currently not used. The voice is hardcoded to 'Kore' in the implementation (audio_utils.ts:138). To use other voices (Puck, Charon, Fenrir, Aoede), the code needs to be modified to use the voice parameter in the speechConfig.

## Differences from Python Version

1. **Async/Await**: All I/O operations are asynchronous and use Promises
2. **Error Handling**: Uses try/catch instead of Python's exception handling
3. **Audio Conversion**: Uses ffmpeg command-line tool instead of pydub library
4. **WAV File Creation**: Implements WAV header creation manually instead of using wave module
5. **Types**: Full TypeScript type definitions for all functions
6. **Automatic Pauses**: Both TTS functions automatically add 2-second pauses after speech

## License

ISC
