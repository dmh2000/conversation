package ai

import (
	"context"
	_ "embed"
	"encoding/xml"
	"fmt"
	"strings"
	"sync"

	"github.com/dmh2000/ai-server/internal/logger"
	"github.com/dmh2000/ai-server/internal/types"
	llmclient "github.com/dmh2000/go-llmclient"
)

const llm_model = "gemini-2.5-pro"

// Alice System Prompt
//
//go:embed alice-system.md
var systemPrompt string

// AliceAI simulates Alice persona that answers questions
type AliceAI struct {
	fromAliceUI <-chan string
	toAliceUI   chan<- types.ConversationMessage
	fromBob     <-chan types.ConversationMessage
	toBob       chan<- types.ConversationMessage
	context     []string
	client      llmclient.Client
	paused      bool
	pauseMutex  sync.Mutex
}

// NewAliceAI creates a new Alice AI component
func NewAliceAI(
	fromServer <-chan string,
	toServer chan<- types.ConversationMessage,
	fromBob <-chan types.ConversationMessage,
	toBob chan<- types.ConversationMessage,
) *AliceAI {
	return &AliceAI{
		fromAliceUI: fromServer,
		toAliceUI:   toServer,
		fromBob:     fromBob,
		toBob:       toBob,
		context:     []string{},
		client:      nil,
	}
}

// Reset clears the conversation context and pauses processing
func (a *AliceAI) Reset() {
	a.pauseMutex.Lock()
	a.paused = true
	a.context = []string{}
	a.pauseMutex.Unlock()
	logger.Println("Alice AI context reset and paused")
}

// Resume allows the AI to process messages again
func (a *AliceAI) Resume() {
	a.pauseMutex.Lock()
	a.paused = false
	a.pauseMutex.Unlock()
	logger.Println("Alice AI resumed")
}

// isPaused returns whether the AI is paused
func (a *AliceAI) isPaused() bool {
	a.pauseMutex.Lock()
	defer a.pauseMutex.Unlock()
	return a.paused
}

// Start begins processing messages
func (a *AliceAI) Start(ctx context.Context) {
	logger.Println("Alice AI started")

	for {
		select {
		case <-ctx.Done():
			logger.Println("Alice AI shutting down")
			return

		case msg := <-a.fromAliceUI:
			// Handle messages from Alice server (should not happen)
			logger.Printf("Alice AI received from server: %s", msg)

		case question := <-a.fromBob:
			// Check if paused - if so, discard message
			if a.isPaused() {
				logger.Println("Alice AI is paused, discarding message from Bob")
				continue
			}
			// Handle questions from Bob AI
			logger.Printf("Alice AI received question from Bob")
			a.processQuestion(question)
		}
	}
}

// processMessage generates a response and sends it to both server and Bob
func (a *AliceAI) processQuestion(msg types.ConversationMessage) error {

	response, err := a.createResponseMessage(msg)
	if err != nil {
		logger.Printf("Error creating response: %v", err)
		return err
	}

	logger.Printf("Alice AI responding")

	// ===============================
	// create UI response
	// ===============================
	text := strings.TrimPrefix(response.Text, "<alice>")
	text = strings.TrimSuffix(text, "</alice>")

	responseToAliceUI := types.ConversationMessage{
		Text: text,
	}

	// Send to Alice server for display
	select {
	case a.toAliceUI <- responseToAliceUI:
		logger.Println("Alice AI sent response to server")

	default:
		logger.Println("Alice server channel full, dropping message")
	}

	// Send text to Bob AI for context
	select {
	case a.toBob <- response:
		logger.Println("Alice AI sent response to Bob AI")

	default:
		logger.Println("Bob AI channel full, dropping message")
	}

	return nil
}

type AliceQuestion struct {
	XMLName xml.Name `xml:"alice"`
	Text    string   `xml:"response"`
}

func validateResonse(response string) string {
	var r AliceQuestion
	err := xml.Unmarshal([]byte(response), &r)
	if err != nil {
		logger.Printf("Error unmarshalling response: %s", response)
		logger.Printf("Error: %v", err)
		if err.Error() == "unexpected EOF" {
			// add the terminator to the response
			return response + "</alice>"
		}
		return "<alice>Hmm, can you repeat the question?</alice>"
	}
	return response
}

func (a *AliceAI) createResponseMessage(msg types.ConversationMessage) (types.ConversationMessage, error) {

	if a.client == nil {
		// create llm client
		client, err := llmclient.NewClient("gemini")
		if err != nil {
			fmt.Println(err)
			return msg, err
		}
		a.client = client
	}

	// Step 1: add bobs question to context
	bob_says := msg.Text
	a.context = append(a.context, bob_says)

	// issue query to alice
	alice_says, err := a.client.QueryText(context.Background(), systemPrompt, a.context, llm_model, llmclient.Options{})
	if err != nil {
		fmt.Println(err)
		return msg, err
	}

	alice_says = validateResonse(alice_says)

	// add alice to context
	a.context = append(a.context, alice_says)

	// create AI response
	aiMsg := types.ConversationMessage{
		Text: alice_says,
	}

	// create UI response
	text := strings.TrimPrefix(alice_says, "<alice>")
	text = strings.TrimSuffix(text, "</alice>")

	// create the UI msg
	uiMsg := types.ConversationMessage{
		Text: text,
	}

	// send it display
	select {
	case a.toAliceUI <- uiMsg:
		logger.Println("Bob AI sent acknowledgment to server")
	default:
		logger.Println("Bob server channel full, dropping acknowledgment")
	}

	return aiMsg, err

}
