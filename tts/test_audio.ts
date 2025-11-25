/**
 * Test program for audio_utils TTS functions
 *
 * This program tests both the Google Gemini and ElevenLabs TTS APIs
 * by generating speech and playing the resulting audio files.
 */

import { speak, speak11, playMp3 } from './audio_utils';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Main test function
 */
async function testAudioUtils() {
  console.log('=== Audio Utils Test Program ===\n');

  // Test text to convert to speech
  const testTextGenai = 'Hello, this is a test of the text to speech system for gemini.';
  const testTextEleven = 'Hello, this is a test of the text to speech system for elevenlabs.';

  // Voice configurations
  const geminiVoice = 'Kore'; // Gemini voice name (options: Puck, Charon, Kore, Fenrir, Aoede)
  const elevenLabsVoiceId = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // Default to Sarah voice

  // Output filenames (without extension)
  const geminiOutput = 'test_gemini';
  const elevenLabsOutput = 'test_elevenlabs';

  try {
    // Test 1: Google Gemini TTS
    console.log('Test 1: Google Gemini TTS');
    console.log(`Voice: ${geminiVoice}`);
    console.log(`Text: "${testTextGenai}"`);
    console.log('Generating speech...\n');

    const geminiFile = await speak(geminiVoice, testTextGenai, geminiOutput);
    console.log(`✓ Gemini audio created: ${geminiFile}`);
    console.log('Playing Gemini audio...\n');
    await playMp3(geminiFile);
    console.log('✓ Gemini audio playback complete\n');

  } catch (error) {
    console.error('✗ Google Gemini test failed:', (error as Error).message);
    console.error('Make sure GOOGLE_API_KEY is set in .env file\n');
  }

  try {
    // Test 2: ElevenLabs TTS
    console.log('Test 2: ElevenLabs TTS');
    console.log(`Voice ID: ${elevenLabsVoiceId}`);
    console.log(`Text: "${testTextEleven}"`);
    console.log('Generating speech...\n');

    const elevenLabsFile = await speak11(elevenLabsVoiceId, testTextEleven, elevenLabsOutput);

    if (elevenLabsFile) {
      console.log(`✓ ElevenLabs audio created: ${elevenLabsFile}`);
      console.log('Playing ElevenLabs audio...\n');
      await playMp3(elevenLabsFile);
      console.log('✓ ElevenLabs audio playback complete\n');
    } else {
      console.error('✗ ElevenLabs test failed: No audio file created');
    }

  } catch (error) {
    console.error('✗ ElevenLabs test failed:', (error as Error).message);
    console.error('Make sure ELEVENLABS_API_KEY is set in .env file\n');
  }

  console.log('=== Test Complete ===');
}

// Run the test
testAudioUtils()
  .then(() => {
    console.log('\nAll tests finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nTest program failed with error:', error);
    process.exit(1);
  });
