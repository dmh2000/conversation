package ai

import (
	"context"
	"log"

	"github.com/dmh2000/ai-server/internal/types"
)

// BobAI simulates Bob persona that asks questions
type BobAI struct {
	fromServer <-chan string
	toServer   chan<- types.ConversationMessage
	toAlice    chan<- string
	fromAlice  <-chan string
}

// NewBobAI creates a new Bob AI component
func NewBobAI(
	fromServer <-chan string,
	toServer chan<- types.ConversationMessage,
	toAlice chan<- string,
	fromAlice <-chan string,
) *BobAI {
	return &BobAI{
		fromServer: fromServer,
		toServer:   toServer,
		toAlice:    toAlice,
		fromAlice:  fromAlice,
	}
}

// Start begins processing messages
func (b *BobAI) Start(ctx context.Context) {
	log.Println("Bob AI started")

	for {
		select {
		case <-ctx.Done():
			log.Println("Bob AI shutting down")
			return

		case msg := <-b.fromServer:
			// Handle initial question/input from Bob client
			log.Printf("Bob AI received from server: %s", msg)
			b.processInitialMessage(msg)

		case msg := <-b.fromAlice:
			// Handle answer from Alice AI
			log.Printf("Bob AI received answer from Alice: %s", msg)
			b.processAliceResponse(msg)
		}
	}
}

// processInitialMessage handles initial input and generates a question for Alice
func (b *BobAI) processInitialMessage(input string) {
	// For now, return a dummy response and forward to Alice
	// Later: integrate with LLM to generate intelligent questions

	// Send acknowledgment to Bob client
	acknowledgment := types.ConversationMessage{
		Text:  "Hello from Bob AI. Processing your input: " + input,
		Audio: "", // Will add audio generation later
	}

	log.Printf("Bob AI acknowledging: %s", acknowledgment.Text)

	select {
	case b.toServer <- acknowledgment:
		log.Println("Bob AI sent acknowledgment to server")
	default:
		log.Println("Bob server channel full, dropping acknowledgment")
	}

	// Generate a question for Alice
	question := "Alice, can you tell me about: " + input + "?"
	log.Printf("Bob AI asking Alice: %s", question)

	select {
	case b.toAlice <- question:
		log.Println("Bob AI sent question to Alice")
	default:
		log.Println("Alice AI channel full, dropping question")
	}
}

// processAliceResponse handles Alice's answer and may generate follow-up
func (b *BobAI) processAliceResponse(answer string) {
	// For now, just acknowledge Alice's response
	// Later: generate intelligent follow-up questions based on Alice's answer

	response := types.ConversationMessage{
		Text:  "Bob AI received from Alice: " + answer,
		Audio: "", // Will add audio generation later
	}

	log.Printf("Bob AI processing Alice's response: %s", response.Text)

	select {
	case b.toServer <- response:
		log.Println("Bob AI sent Alice's response to server")
	default:
		log.Println("Bob server channel full, dropping response")
	}

	// TODO: Later, generate follow-up question based on answer
	// followUp := generateFollowUpQuestion(answer)
	// b.toAlice <- followUp
}
