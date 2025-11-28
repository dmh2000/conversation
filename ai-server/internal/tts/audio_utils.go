package tts

import (
	"bytes"
	"context"
	"encoding/binary"
	"fmt"
	"os"
	"os/exec"

	"google.golang.org/genai"
)

// WaveFile saves PCM audio data to a WAV file.
//
// filename: Path where the WAV file will be saved
// pcm: Raw PCM audio data
// channels: Number of audio channels (1=mono, 2=stereo, default: 1)
// rate: Sample rate in Hz (default: 24000)
// sampleWidth: Sample width in bytes (2=16-bit, default: 2)
func WaveFile(filename string, pcm []byte, channels int, rate int, sampleWidth int) error {
	file, err := os.Create(filename)
	if err != nil {
		return fmt.Errorf("failed to create file: %w", err)
	}
	defer file.Close()

	dataSize := uint32(len(pcm))
	fileSize := uint32(36 + dataSize)

	// WAV file header structure
	buf := new(bytes.Buffer)

	// RIFF chunk descriptor
	buf.WriteString("RIFF")
	if err := binary.Write(buf, binary.LittleEndian, fileSize); err != nil {
		return err
	}
	buf.WriteString("WAVE")

	// fmt sub-chunk
	buf.WriteString("fmt ")
	if err := binary.Write(buf, binary.LittleEndian, uint32(16)); err != nil { // Subchunk1Size (16 for PCM)
		return err
	}
	if err := binary.Write(buf, binary.LittleEndian, uint16(1)); err != nil { // AudioFormat (1 for PCM)
		return err
	}
	if err := binary.Write(buf, binary.LittleEndian, uint16(channels)); err != nil {
		return err
	}
	if err := binary.Write(buf, binary.LittleEndian, uint32(rate)); err != nil {
		return err
	}
	// ByteRate = SampleRate * NumChannels * BitsPerSample/8
	if err := binary.Write(buf, binary.LittleEndian, uint32(rate*channels*sampleWidth)); err != nil {
		return err
	}
	// BlockAlign = NumChannels * BitsPerSample/8
	if err := binary.Write(buf, binary.LittleEndian, uint16(channels*sampleWidth)); err != nil {
		return err
	}
	// BitsPerSample
	if err := binary.Write(buf, binary.LittleEndian, uint16(sampleWidth*8)); err != nil {
		return err
	}

	// data sub-chunk
	buf.WriteString("data")
	if err := binary.Write(buf, binary.LittleEndian, dataSize); err != nil {
		return err
	}

	// Write header to file
	if _, err := file.Write(buf.Bytes()); err != nil {
		return fmt.Errorf("failed to write header: %w", err)
	}

	// Write PCM data to file
	if _, err := file.Write(pcm); err != nil {
		return fmt.Errorf("failed to write pcm data: %w", err)
	}

	return nil
}

// PcmToMp3 converts PCM audio data to MP3 format and saves to file.
//
// pcmData: Raw PCM audio data
// outputFilename: Path to save the MP3 file
// channels: Number of audio channels (default: 1 for mono)
// sampleWidth: Sample width in bytes (default: 2 for 16-bit)
// frameRate: Sample rate in Hz (default: 24000)
// Returns Path to the created MP3 file
func PcmToMp3(pcmData []byte, outputFilename string, channels int, sampleWidth int, frameRate int) (string, error) {
	// Create a temporary WAV file from PCM data
	tempWavFile := outputFilename + ".temp.wav"
	if err := WaveFile(tempWavFile, pcmData, channels, frameRate, sampleWidth); err != nil {
		return "", err
	}
	defer os.Remove(tempWavFile)

	// Convert WAV to MP3 using ffmpeg
	// -i: input file
	// -codec:a libmp3lame: audio codec
	// -qscale:a 2: audio quality (variable bitrate)
	// -y: overwrite output file
	cmd := exec.Command("ffmpeg", "-i", tempWavFile, "-codec:a", "libmp3lame", "-qscale:a", "2", outputFilename, "-y")
	output, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("ffmpeg error: %s: %w", string(output), err)
	}

	return outputFilename, nil
}

// Speak generates speech from text using Google Gemini TTS API and saves as MP3.
//
// ctx: Context for the API call
// voice: Voice name from Gemini's prebuilt voice options (e.g., "Kore")
// text: Text to convert to speech
// filename: Base filename for the output MP3 file (without extension)
// Returns Path to the generated MP3 file
func Speak(ctx context.Context, voice string, text string, filename string) (string, error) {
	// Retry up to 3 times in case of transient errors
	addPause := fmt.Sprintf(`"%s", wait 2 seconds after speaking`, text)

	var lastErr error

	apiKey := os.Getenv("GOOGLE_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("GOOGLE_API_KEY environment variable is not set")
	}

	client, err := genai.NewClient(ctx, &genai.ClientConfig{APIKey: apiKey})
	if err != nil {
		return "", fmt.Errorf("failed to create genai client: %w", err)
	}

	for i := 0; i < 3; i++ {
		resp, err := client.Models.GenerateContent(ctx, "gemini-2.5-flash-preview-tts",
			genai.Text(addPause),
			&genai.GenerateContentConfig{
				ResponseModalities: []string{"AUDIO"},
				SpeechConfig: &genai.SpeechConfig{
					VoiceConfig: &genai.VoiceConfig{
						PrebuiltVoiceConfig: &genai.PrebuiltVoiceConfig{
							VoiceName: voice,
						},
					},
				},
			},
		)

		if err != nil {
			lastErr = err
			fmt.Printf("Error in speak (attempt %d/3): %v\n", i+1, err)
			continue
		}

		// Extract PCM audio data from the response
		// Structure navigation depends on the specific genai library response format.
		// Assuming standard Candidates -> Content -> Parts -> InlineData
		if len(resp.Candidates) == 0 || resp.Candidates[0].Content == nil || len(resp.Candidates[0].Content.Parts) == 0 {
			lastErr = fmt.Errorf("no content in response")
			fmt.Printf("Error in speak (attempt %d/3): %v\n", i+1, lastErr)
			continue
		}

		part := resp.Candidates[0].Content.Parts[0]

		// The Go library handles InlineData differently than the raw JSON or JS SDK usually.
		// We expect the part to be of type Blob or similar containing the data.
		// In the google.golang.org/genai library, Parts are often interface{}.
		// We need to check if it has InlineData.

		var pcmBuffer []byte

		if part.InlineData != nil {
			pcmBuffer = part.InlineData.Data
		} else {
			lastErr = fmt.Errorf("part does not contain InlineData")
			fmt.Printf("Error in speak (attempt %d/3): %v\n", i+1, lastErr)
			continue
		}

		if len(pcmBuffer) == 0 {
			lastErr = fmt.Errorf("empty audio data received")
			fmt.Printf("Error in speak (attempt %d/3): %v\n", i+1, lastErr)
			continue
		}

		// Convert PCM data to MP3 format and save
		finalFileName := filename + ".mp3"
		if _, err := PcmToMp3(pcmBuffer, finalFileName, 1, 2, 24000); err != nil {
			lastErr = err
			fmt.Printf("Error converting to MP3 (attempt %d/3): %v\n", i+1, err)
			continue
		}

		return finalFileName, nil
	}

	return "", fmt.Errorf("all retry attempts failed: %w", lastErr)
}

// PlayWave plays a WAV audio file using ffplay.
//
// wavFile: Path to the WAV file to play
func PlayWave(wavFile string) error {
	// Run ffplay with:
	// -nodisp: Don't show video display window
	// -autoexit: Exit when playback finishes
	cmd := exec.Command("ffplay", "-nodisp", "-autoexit", wavFile)

	// Capture stderr to report detailed errors if needed, similar to TS
	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		return fmt.Errorf("error running ffplay: %w, stderr: %s", err, stderr.String())
	}
	return nil
}

// PlayMp3 plays an MP3 audio file using ffplay.
//
// mp3File: Path to the MP3 file to play
func PlayMp3(mp3File string) error {
	// Run ffplay with:
	// -nodisp: Don't show video display window
	// -autoexit: Exit when playback finishes
	cmd := exec.Command("ffplay", "-nodisp", "-autoexit", mp3File)

	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		return fmt.Errorf("error running ffplay: %w, stderr: %s", err, stderr.String())
	}
	return nil
}
