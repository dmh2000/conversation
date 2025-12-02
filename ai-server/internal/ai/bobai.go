package ai

import (
	"context"
	_ "embed"
	"fmt"
	"strings"

	"github.com/dmh2000/ai-server/internal/logger"
	"github.com/dmh2000/ai-server/internal/tts"
	"github.com/dmh2000/ai-server/internal/types"
	llmclient "github.com/dmh2000/go-llmclient"
)

// Bob System Prompt
//
//go:embed bob-system.md
var systemPromptBob string

// BobAI simulates Bob persona that asks questions
type BobAI struct {
	fromBobUI <-chan string
	toBobUI   chan<- types.ConversationMessage
	toAlice   chan<- types.ConversationMessage
	fromAlice <-chan types.ConversationMessage
	context   []string
	client    llmclient.Client
}

// NewBobAI creates a new Bob AI component
func NewBobAI(
	fromServer <-chan string,
	toServer chan<- types.ConversationMessage,
	toAlice chan<- types.ConversationMessage,
	fromAlice <-chan types.ConversationMessage,
) *BobAI {
	return &BobAI{
		fromBobUI: fromServer,
		toBobUI:   toServer,
		toAlice:   toAlice,
		fromAlice: fromAlice,
		context:   []string{},
		client:    nil,
	}
}

// Start begins processing messages
func (b *BobAI) Start(ctx context.Context) {
	logger.Println("Bob AI started")

	for {
		select {
		case <-ctx.Done():
			logger.Println("Bob AI shutting down")
			return

		case msg := <-b.fromBobUI:
			// Handle initial question/input from Bob client
			logger.Printf("Bob AI processing initial message")
			b.processInitialMessage(msg)

		case msg := <-b.fromAlice:
			// Handle answer from Alice AI
			logger.Printf("Bob AI received answer from Alice: %s", msg)
			b.processResponse(msg)
		}
	}
}

// processInitialMessage handles initial input and generates a question for Alice
func (b *BobAI) processInitialMessage(input string) {
	// For now, return a dummy response and forward to Alice
	// Later: integrate with LLM to generate intelligent questions

	// Send acknowledgment to Bob client
	initialMessage := types.ConversationMessage{
		Text:  input,
		Audio: "",
	}

	// initialMessage = tts.CreateMp3(context.Background(), initialMessage, "../../bob/client/public/audio", "/audio")
	logger.Printf("Bob initial message: %v", initialMessage)

	select {
	case b.toBobUI <- initialMessage:
		logger.Println("Bob AI sent acknowledgment to server")
	default:
		logger.Println("Bob server channel full, dropping acknowledgment")
	}

	// Generate a question for Alice
	question := fmt.Sprintf("<bob>%s</bob>", input)

	// add question to Bob's context
	b.context = append(b.context, question)

	questionMsg := types.ConversationMessage{
		Text:  question,
		Audio: "",
	}

	select {
	case b.toAlice <- questionMsg:
		logger.Println("Bob AI sent question to Alice")
	default:
		logger.Println("Alice AI channel full, dropping question")
	}
}

// processResponse handles Alice's answer and may generate follow-up
func (b *BobAI) processResponse(answerFromAlice types.ConversationMessage) {
	logger.Printf("Bob AI processing Alice's response")

	questionFromBob, err := b.createQuestionToAlice(answerFromAlice)
	if err != nil {
		logger.Printf("Error creating response: %v", err)
		return
	}

	select {
	case b.toAlice <- questionFromBob:
		logger.Println("Bob AI sent Alice's response to server")
	default:
		logger.Println("Bob server channel full, dropping response")
	}

}

func validateQuestion(question string) error {
	if strings.Contains(question, "<alice>") {
		return fmt.Errorf("question has alice")
	}
	return nil
}

func (b *BobAI) createQuestionToAlice(answerFromAlice types.ConversationMessage) (types.ConversationMessage, error) {

	if b.client == nil {
		// create llm client
		client, err := llmclient.NewClient("gemini")
		if err != nil {
			fmt.Println(err)
			return answerFromAlice, err
		}
		b.client = client
	}

	// Step 1: add alice response to context
	b.context = append(b.context, answerFromAlice.Text)

	// issue query to alice
	question, err := b.client.QueryText(context.Background(), systemPromptBob, b.context, llm_model, llmclient.Options{})
	if err != nil {
		fmt.Println(err)
		return answerFromAlice, err
	}

	err = validateQuestion(question)

	// add alice to context
	b.context = append(b.context, question)

	logger.Printf("%s", question)
	questionToAlice := types.ConversationMessage{
		Text:  question,
		Audio: "",
	}

	// create the mp3
	text := strings.TrimPrefix(questionToAlice.Text, "<bob>")
	text = strings.TrimSuffix(text, "</bob>")

	uiMsg := types.ConversationMessage{
		Text:  text,
		Audio: "",
	}

	uiMsg = tts.CreateMp3(context.Background(), uiMsg, "../../bob/client/public/audio", "/audio")

	// send it display
	select {
	case b.toBobUI <- uiMsg:
		logger.Println("Bob AI sent acknowledgment to server")
	default:
		logger.Println("Bob server channel full, dropping acknowledgment")
	}

	return questionToAlice, err

}
