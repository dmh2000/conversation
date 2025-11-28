package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/dmh2000/ai-server/internal/tts"
)

func main() {
	// Check for GOOGLE_API_KEY
	if os.Getenv("GOOGLE_API_KEY") == "" {
		log.Fatal("GOOGLE_API_KEY environment variable is not set")
	}

	ctx := context.Background()
	text := "Hello World!"
	// Using "Puck" as the voice
	voice := "Puck" 
	// Output file path
	filename := "hello_world" 

	fmt.Printf("Generating audio for: %q\n", text)
	
	// Generate MP3
	mp3File, err := tts.Speak(ctx, voice, text, filename)
	if err != nil {
		log.Fatalf("Error generating speech: %v", err)
	}
	fmt.Printf("Audio generated successfully: %s\n", mp3File)

	// Play MP3
	fmt.Println("Playing audio...")
	if err := tts.PlayMp3(mp3File); err != nil {
		log.Fatalf("Error playing audio: %v", err)
	}
	fmt.Println("Playback complete.")

	// Clean up
	if err := os.Remove(mp3File); err != nil {
		log.Printf("Warning: failed to delete temp file %s: %v", mp3File, err)
	}
}
