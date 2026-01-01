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

// Bob System Prompt
//
//go:embed bob-system.md
var systemPromptBob string

// BobAI simulates Bob persona that asks questions
type BobAI struct {
	fromBobUI      <-chan string
	toBobUI        chan<- types.ConversationMessage
	toAlice        chan<- types.ConversationMessage
	fromAlice      <-chan types.ConversationMessage
	context        []string
	client         llmclient.Client
	clientOnce     sync.Once
	clientErr      error
	paused         bool
	pauseMutex     sync.Mutex
	onStartNewConv func() // callback when new conversation starts
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

// Reset clears the conversation context and pauses processing
func (b *BobAI) Reset() {
	b.pauseMutex.Lock()
	b.paused = true
	b.context = []string{}
	b.pauseMutex.Unlock()
	logger.Println("Bob AI context reset and paused")
}

// Resume allows the AI to process messages again
func (b *BobAI) Resume() {
	b.pauseMutex.Lock()
	b.paused = false
	b.pauseMutex.Unlock()
	logger.Println("Bob AI resumed")
}

// isPaused returns whether the AI is paused
func (b *BobAI) isPaused() bool {
	b.pauseMutex.Lock()
	defer b.pauseMutex.Unlock()
	return b.paused
}

// SetStartNewConvCallback sets the callback for when a new conversation starts
func (b *BobAI) SetStartNewConvCallback(fn func()) {
	b.onStartNewConv = fn
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
			// New message from UI - resume processing and notify Alice
			b.Resume()
			if b.onStartNewConv != nil {
				b.onStartNewConv()
			}
			logger.Printf("Bob AI processing initial message")
			b.processInitialMessage(msg)

		case msg := <-b.fromAlice:
			// Check if paused - if so, discard message
			if b.isPaused() {
				logger.Println("Bob AI is paused, discarding message from Alice")
				continue
			}
			// Handle answer from Alice AI
			logger.Printf("Bob AI received answer from Alice")
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
		Text: input,
	}

	logger.Printf("Bob initial message: %v", initialMessage)

	select {
	case b.toBobUI <- initialMessage:
		logger.Println("Bob AI sent acknowledgment to server")
	default:
		logger.Println("Bob server channel full, dropping acknowledgment")
	}

	// Generate a question for Alice
	question := "<bob>" + input + "</bob>"

	// add question to Bob's context
	b.context = append(b.context, question)

	questionMsg := types.ConversationMessage{
		Text: question,
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

type BobQuestion struct {
	XMLName xml.Name `xml:"bob"`
	Text    string   `xml:"question"`
}

func validateQuestion(question string) string {
	var r BobQuestion
	err := xml.Unmarshal([]byte(question), &r)
	if err != nil {
		logger.Printf("Error unmarshalling response: %s", question)
		logger.Printf("Error: %v", err)
		if strings.Contains(err.Error(), "unexpected EOF") {
			// add the terminator to the response
			return question + "</bob>"
		}
		return "<bob>Oops, I lost my train of thought. Where was I?</bob>"
	}
	return question
}

func (b *BobAI) createQuestionToAlice(answerFromAlice types.ConversationMessage) (types.ConversationMessage, error) {
	// Thread-safe lazy initialization of client
	b.clientOnce.Do(func() {
		client, err := llmclient.NewClient("gemini")
		if err != nil {
			logger.Printf("Error creating LLM client: %v", err)
			b.clientErr = err
			return
		}
		b.client = client
	})

	if b.clientErr != nil {
		return answerFromAlice, b.clientErr
	}

	// Step 1: add alice response to context
	b.context = append(b.context, answerFromAlice.Text)
	logger.Printf("---> alice %s", answerFromAlice.Text)

	// issue query to bob
	question, err := b.client.QueryText(context.Background(), systemPromptBob, b.context, llmModel, llmclient.Options{})
	if err != nil {
		logger.Printf("Error querying LLM: %v", err)
		return answerFromAlice, err
	}

	logger.Printf("<-- bob  %s", question)

	// make sure the question the ai generated is in the proper xml format
	question = validateQuestion(question)

	// add question to context
	b.context = append(b.context, question)

	logger.Printf("%s", question)
	questionToAlice := types.ConversationMessage{
		Text: question,
	}

	// create the UI msg
	text := strings.TrimPrefix(questionToAlice.Text, "<bob>")
	text = strings.TrimSuffix(text, "</bob>")

	uiMsg := types.ConversationMessage{
		Text: text,
	}

	// send to display
	select {
	case b.toBobUI <- uiMsg:
		logger.Println("Bob AI sent acknowledgment to server")
	default:
		logger.Println("Bob server channel full, dropping acknowledgment")
	}

	return questionToAlice, nil
}
