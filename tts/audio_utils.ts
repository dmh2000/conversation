/**
 * Audio utilities for text-to-speech and audio playback.
 *
 * This module provides functions for:
 * - Generating speech from text using Google Gemini and ElevenLabs TTS APIs
 * - Converting between audio formats (PCM to WAV/MP3)
 * - Playing audio files using ffplay
 */

import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import {GoogleGenAI} from '@google/genai'
import { ElevenLabsClient } from 'elevenlabs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const execAsync = promisify(exec);


/**
 * Save PCM audio data to a WAV file.
 *
 * @param filename - Path where the WAV file will be saved
 * @param pcm - Raw PCM audio data (Buffer)
 * @param channels - Number of audio channels (1=mono, 2=stereo, default: 1)
 * @param rate - Sample rate in Hz (default: 24000)
 * @param sampleWidth - Sample width in bytes (2=16-bit, default: 2)
 */
export function waveFile(
  filename: string,
  pcm: Buffer,
  channels: number = 1,
  rate: number = 24000,
  sampleWidth: number = 2
): void {
  // WAV file header structure
  const header = Buffer.alloc(44);
  const dataSize = pcm.length;
  const fileSize = 36 + dataSize;

  // RIFF chunk descriptor
  header.write('RIFF', 0);
  header.writeUInt32LE(fileSize, 4);
  header.write('WAVE', 8);

  // fmt sub-chunk
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  header.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(rate, 24);
  header.writeUInt32LE(rate * channels * sampleWidth, 28); // ByteRate
  header.writeUInt16LE(channels * sampleWidth, 32); // BlockAlign
  header.writeUInt16LE(sampleWidth * 8, 34); // BitsPerSample

  // data sub-chunk
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  // Write header and PCM data to file
  fs.writeFileSync(filename, Buffer.concat([header, pcm]));
}

/**
 * Convert PCM audio data to MP3 format and save to file.
 *
 * @param pcmData - Raw PCM audio data (Buffer)
 * @param outputFilename - Path to save the MP3 file
 * @param channels - Number of audio channels (default: 1 for mono)
 * @param sampleWidth - Sample width in bytes (default: 2 for 16-bit)
 * @param frameRate - Sample rate in Hz (default: 24000)
 * @returns Path to the created MP3 file
 */
export async function pcmToMp3(
  pcmData: Buffer,
  outputFilename: string,
  channels: number = 1,
  sampleWidth: number = 2,
  frameRate: number = 24000
): Promise<string> {
  try {
    // Create a temporary WAV file from PCM data
    const tempWavFile = `${outputFilename}.temp.wav`;
    waveFile(tempWavFile, pcmData, channels, frameRate, sampleWidth);

    // Convert WAV to MP3 using ffmpeg
    await execAsync(`ffmpeg -i "${tempWavFile}" -codec:a libmp3lame -qscale:a 2 "${outputFilename}" -y`);

    // Remove temporary WAV file
    fs.unlinkSync(tempWavFile);

    return outputFilename;
  } catch (e) {
    const error = e as Error;
    console.error(`Error converting PCM to MP3: ${error.message}`);
    throw error;
  }
}

/**
 * Generate speech from text using Google Gemini TTS API and save as MP3.
 *
 * @param voice - Voice name from Gemini's prebuilt voice options
 * @param text - Text to convert to speech
 * @param filename - Base filename for the output MP3 file (without extension)
 * @returns Path to the generated MP3 file
 * @throws Error if all 3 retry attempts fail
 */
export async function speak(
  voice: string,
  text: string,
  filename: string
): Promise<string> {
  // Retry up to 3 times in case of transient errors
  const addPause = `"${text}", wait 2 seconds after speaking`;

  for (let i = 0; i < 3; i++) {
    try {
      // Initialize Google Gemini client with API key from environment
      const apiKey = process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        throw new Error('GOOGLE_API_KEY environment variable is not set');
      }

      const genAI = new GoogleGenAI({apiKey});

      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text:addPause }] }],
        config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
              },
          },
        });

      // Extract PCM audio data from the response
      const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!data) {
        throw new Error('No audio data received from Gemini API');
      }

      // Convert base64 to Buffer
      const pcmBuffer = Buffer.from(data, 'base64');

      // Convert PCM data to MP3 format and save
      const fileName = `${filename}.mp3`;
      await pcmToMp3(pcmBuffer, fileName);

      return fileName;
    } catch (e) {
      // Log detailed error information for debugging
      const error = e as Error;
      console.error(`Error in speak (attempt ${i + 1}/3): ${error.message}`);
      console.error(`Exception type: ${error.name}`);
      console.error(`Stack trace:`, error.stack);

      if (i === 2) {
        // Last attempt failed
        throw error;
      }
    }
  }

  throw new Error('All retry attempts failed');
}


/**
 * Generate speech from text using ElevenLabs TTS API and save as MP3.
 *
 * @param voice - ElevenLabs voice ID
 * @param text - Text to convert to speech
 * @param filename - Path where the MP3 file will be saved (without extension)
 * @returns Path to the MP3 file, or null on error
 */
export async function speak11(
  voice: string,
  text: string,
  filename: string
): Promise<string | null> {
  text = `"${text}<break time=\"2s\" />`;
  try {
    // Initialize ElevenLabs client with API key
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY environment variable is not set');
    }

    const elevenlabs = new ElevenLabsClient({ apiKey });

    // Convert text to speech using specified voice
    // Output format: MP3 at 44.1kHz sample rate with 128kbps bitrate
    const audio = await elevenlabs.textToSpeech.convert(voice, {
      text,
      output_format: 'mp3_44100_128',
    });

    // Write the audio stream to file
    const outputPath = `${filename}.mp3`;
    const chunks: Buffer[] = [];

    // Collect all chunks from the stream
    for await (const chunk of audio) {
      chunks.push(Buffer.from(chunk));
    }

    // Combine all audio chunks into a single buffer and write to file
    const audioBuffer = Buffer.concat(chunks);
    fs.writeFileSync(outputPath, audioBuffer);

    return outputPath;
  } catch (e) {
    // Log error details and return null to indicate failure
    const error = e as Error;
    console.error(`Error in speak11: ${error.message}`);
    console.error(error.stack);
    return null;
  }
}


/**
 * Play WAV audio file using ffplay.
 *
 * @param wavFile - Path to the WAV file to play
 * @throws Error if ffplay fails to execute
 */
export async function playWave(wavFile: string): Promise<void> {
  try {
    // Run ffplay with:
    // -nodisp: Don't show video display window
    // -autoexit: Exit when playback finishes
    await execAsync(`ffplay -nodisp -autoexit "${wavFile}"`);
  } catch (e) {
    const error = e as any;
    console.error(`Error running ffplay: ${error.message}`);
    console.error(`stderr: ${error.stderr}`);
    throw error;
  }
}

/**
 * Play MP3 audio file using ffplay.
 *
 * @param mp3File - Path to the MP3 file to play
 * @throws Error if ffplay fails to execute
 */
export async function playMp3(mp3File: string): Promise<void> {
  try {
    // Run ffplay with:
    // -nodisp: Don't show video display window
    // -autoexit: Exit when playback finishes
    await execAsync(`ffplay -nodisp -autoexit "${mp3File}"`);
  } catch (e) {
    const error = e as any;
    console.error(`Error running ffplay: ${error.message}`);
    console.error(`stderr: ${error.stderr}`);
    throw error;
  }
}


