package ai

import (
	"context"
	_ "embed"
	"encoding/xml"
	"strings"
	"sync"

	"github.com/dmh2000/ai-server/internal/logger"
	"github.com/dmh2000/ai-server/internal/types"
	llmclient "github.com/dmh2000/go-llmclient"
)

const llmModel = "gemini-2.5-pro"

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
	clientOnce  sync.Once
	clientErr   error
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

func validateResponse(response string) string {
	var r AliceQuestion
	err := xml.Unmarshal([]byte(response), &r)
	if err != nil {
		logger.Printf("Error unmarshalling response: %s", response)
		logger.Printf("Error: %v", err)
		if strings.Contains(err.Error(), "unexpected EOF") {
			// add the terminator to the response
			return response + "</alice>"
		}
		return "<alice>Hmm, can you repeat the question?</alice>"
	}
	return response
}

func (a *AliceAI) createResponseMessage(msg types.ConversationMessage) (types.ConversationMessage, error) {
	// Thread-safe lazy initialization of client
	a.clientOnce.Do(func() {
		client, err := llmclient.NewClient("gemini")
		if err != nil {
			logger.Printf("Error creating LLM client: %v", err)
			a.clientErr = err
			return
		}
		a.client = client
	})

	if a.clientErr != nil {
		return msg, a.clientErr
	}

	logger.Printf("--->bob: %s", msg.Text)
	// Step 1: add bobs question to context
	bobSays := msg.Text
	a.context = append(a.context, bobSays)

	// issue query to alice
	aliceSays, err := a.client.QueryText(context.Background(), systemPrompt, a.context, llmModel, llmclient.Options{})
	if err != nil {
		logger.Printf("Error querying LLM: %v", err)
		return msg, err
	}
	logger.Printf("<---alice: %s", aliceSays)

	aliceSays = validateResponse(aliceSays)

	// add alice to context
	a.context = append(a.context, aliceSays)

	// create AI response
	aiMsg := types.ConversationMessage{
		Text: aliceSays,
	}

	return aiMsg, nil
}
