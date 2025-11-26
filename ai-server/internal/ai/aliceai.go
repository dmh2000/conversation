package ai

import (
	"context"
	"log"

	"github.com/dmh2000/ai-server/internal/types"
)

// AliceAI simulates Alice persona that answers questions
type AliceAI struct {
	fromServer <-chan string
	toServer   chan<- types.ConversationMessage
	fromBob    <-chan string
	toBob      chan<- string
}

// NewAliceAI creates a new Alice AI component
func NewAliceAI(
	fromServer <-chan string,
	toServer chan<- types.ConversationMessage,
	fromBob <-chan string,
	toBob chan<- string,
) *AliceAI {
	return &AliceAI{
		fromServer: fromServer,
		toServer:   toServer,
		fromBob:    fromBob,
		toBob:      toBob,
	}
}

// Start begins processing messages
func (a *AliceAI) Start(ctx context.Context) {
	log.Println("Alice AI started")

	for {
		select {
		case <-ctx.Done():
			log.Println("Alice AI shutting down")
			return

		case msg := <-a.fromServer:
			// Handle messages from Alice server (if any)
			log.Printf("Alice AI received from server: %s", msg)
			a.processMessage(msg)

		case msg := <-a.fromBob:
			// Handle questions from Bob AI
			log.Printf("Alice AI received question from Bob: %s", msg)
			a.processMessage(msg)
		}
	}
}

// processMessage generates a response and sends it to both server and Bob
func (a *AliceAI) processMessage(input string) {
	// For now, return a dummy response
	// Later: integrate with LLM to generate intelligent answers
	response := types.ConversationMessage{
		Text:  "Hello from Alice AI. You said: " + input,
		Audio: "", // Will add audio generation later
	}

	log.Printf("Alice AI responding: %s", response.Text)

	// Send to Alice server for display
	select {
	case a.toServer <- response:
		log.Println("Alice AI sent response to server")
	default:
		log.Println("Alice server channel full, dropping message")
	}

	// Send text to Bob AI for context
	select {
	case a.toBob <- response.Text:
		log.Println("Alice AI sent response to Bob AI")
	default:
		log.Println("Bob AI channel full, dropping message")
	}
}
