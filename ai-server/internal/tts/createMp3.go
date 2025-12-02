package tts

import (
	"context"

	"github.com/dmh2000/ai-server/internal/types"
)

func CreateMp3(ctx context.Context, msg types.ConversationMessage, path_prefix string, ui_path string) types.ConversationMessage {
	// // Generate Audio from text
	// timestamp := time.Now().UnixNano()
	// baseFilename := fmt.Sprintf("audio_%d", timestamp)

	// // Target directories:
	// // ../../bob/client/public
	// // ../../alice/client/public
	// outputPath := fmt.Sprintf("%s/%s", path_prefix, baseFilename)

	// // Generate the audio file (Puck voice)
	// voice := "Puck"
	// // Note: Speak appends .mp3 to the filename
	// generatedFile, err := Speak(ctx, voice, msg.Text, outputPath)
	// if err != nil {
	// 	logger.Printf("Failed to generate speech: %v", err)
	// } else {
	// 	logger.Printf("Generated audio: %s", generatedFile)
	// 	// Set the Audio field to the filename (relative to public root for the client)
	// 	msg.Audio = fmt.Sprintf("%s/%s.mp3", ui_path, baseFilename)
	// }
	return msg
}
