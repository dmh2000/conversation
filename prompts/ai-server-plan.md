# AI Server Implementation Plan

## Overview
Implement a Go-based WebSocket server that simulates a conversation between two AI personas: Bob (who asks questions) and Alice (who answers questions). The server will communicate with existing React web clients via WebSocket connections.

## Architecture

### Components
1. **BobServer** - WebSocket server listening on port 8004 for Bob web client
2. **BobAI** - Goroutine simulating Bob persona using LLM (asks questions)
3. **AliceServer** - WebSocket server listening on port 8003 for Alice web client
4. **AliceAI** - Goroutine simulating Alice persona using LLM (answers questions)

### Communication Channels
```
┌─────────────┐      ┌────────┐      ┌─────────┐
│ Bob Client  │◄────►│  Bob   │◄────►│  Bob    │
│  (Port      │  WS  │ Server │ Chan │   AI    │
│   8004)     │      └────────┘      └────┬────┘
└─────────────┘                           │
                                          │ Chan
                                          ▼
┌─────────────┐      ┌────────┐      ┌─────────┐
│Alice Client │◄────►│ Alice  │◄────►│  Alice  │
│  (Port      │  WS  │ Server │ Chan │   AI    │
│   8003)     │      └────────┘      └─────────┘
└─────────────┘
```

### Data Flow
1. Bob Client sends initial question text → BobServer → BobAI
2. BobAI generates question (text + audio) → AliceAI
3. AliceAI generates answer (text + audio) → AliceServer → Alice Client
4. AliceAI also sends answer back to BobAI (for context)
5. BobAI generates follow-up question based on answer → repeats cycle

## Message Format

### WebSocket Messages (JSON)
```json
{
  "text": "string",     // Message text
  "audio": "string"     // Audio file path (e.g., "/audio/file.mp3")
}
```

### Channel Messages
- Simple strings containing just the text content
- Audio handling is done by AI components before sending to WebSocket servers

## Project Structure

```
ai-server/
├── go.mod
├── go.sum
├── cmd/
│   └── main.go              # Entry point, orchestrates all components
├── internal/
│   ├── server/
│   │   ├── bobserver.go     # Bob WebSocket server
│   │   └── aliceserver.go   # Alice WebSocket server
│   ├── ai/
│   │   ├── bobai.go         # Bob AI persona
│   │   └── aliceai.go       # Alice AI persona
│   ├── types/
│   │   └── message.go       # Shared types and structs
│   └── audio/
│       └── generator.go     # Audio generation utilities
├── public/
│   └── audio/               # Static audio files
└── config/
    └── config.go            # Configuration (ports, API keys, etc.)
```

## Implementation Steps

### Phase 1: Project Setup
1. Create `ai-server` directory
2. Initialize Go module: `go mod init github.com/dmh2000/ai-server`
3. Create directory structure (cmd, internal, public, config)
4. Install dependencies:
   - `github.com/gorilla/websocket` - WebSocket support
   - `github.com/anthropics/anthropic-sdk-go` or similar - AI LLM integration
   - Audio generation library (TBD - possibly call external API or use system TTS)

### Phase 2: Define Core Types and Configuration
**File: `internal/types/message.go`**
```go
type ConversationMessage struct {
    Text  string `json:"text"`
    Audio string `json:"audio"`
}
```

**File: `config/config.go`**
- Define port numbers (8003 for Alice, 8004 for Bob)
- AI API keys and endpoints
- Audio generation settings
- Channel buffer sizes

### Phase 3: Implement WebSocket Servers

**File: `internal/server/aliceserver.go`**
- Create WebSocket server listening on port 8003
- Accept only one client connection at a time
- When connection closes, listen for new connection
- Receive messages from client (if any - Alice is mostly receive-only)
- Forward incoming text to AliceAI via channel
- Receive ConversationMessage from AliceAI via channel
- Broadcast JSON messages to connected client
- Handle connection errors and reconnection

**File: `internal/server/bobserver.go`**
- Create WebSocket server listening on port 8004
- Accept only one client connection at a time
- When connection closes, listen for new connection
- Receive messages from Bob client (initial question/input)
- Forward incoming text to BobAI via channel
- Receive ConversationMessage from BobAI via channel
- Broadcast JSON messages to connected client
- Handle connection errors and reconnection

### Phase 4: Implement AI Components (Initial Scaffolding)

**File: `internal/ai/bobai.go`**
- Initial implementation: Return dummy message "Hello from Bob AI"
- Set up goroutine that listens on input channel from BobServer
- Send responses to:
  1. BobServer (with audio path)
  2. AliceAI (text only)
- Later: Integrate with LLM to generate questions
- Maintain conversation context

**File: `internal/ai/aliceai.go`**
- Initial implementation: Return dummy message "Hello from Alice AI"
- Set up goroutine that listens on input channel from:
  1. AliceServer (if client sends anything)
  2. BobAI (questions to answer)
- Send responses to:
  1. AliceServer (with audio path)
  2. BobAI (for context)
- Later: Integrate with LLM to generate answers
- Maintain conversation context

### Phase 5: Channel Setup

**File: `cmd/main.go`**

Create channels:
```go
// BobServer <-> BobAI
bobServerToAI := make(chan string, 10)
bobAIToServer := make(chan ConversationMessage, 10)

// AliceServer <-> AliceAI
aliceServerToAI := make(chan string, 10)
aliceAIToServer := make(chan ConversationMessage, 10)

// BobAI -> AliceAI
bobToAlice := make(chan string, 10)

// AliceAI -> BobAI (for context)
aliceToBob := make(chan string, 10)
```

### Phase 6: Main Orchestration

**File: `cmd/main.go`**
- Initialize configuration
- Create all channels
- Start AliceServer goroutine with channels
- Start BobServer goroutine with channels
- Start AliceAI goroutine with channels
- Start BobAI goroutine with channels
- Set up graceful shutdown handling (context cancellation)
- Wait for all goroutines or block forever

### Phase 7: Static File Serving
- Serve `/public/audio` directory for audio files
- Both WebSocket servers can include HTTP server for static files
- Or use a separate HTTP server on a different port

### Phase 8: Audio Generation (Future)
**File: `internal/audio/generator.go`**
- Integrate with TTS service (Google TTS, ElevenLabs, etc.)
- Generate audio files from text
- Save to `/public/audio/` directory
- Return relative path (e.g., `/audio/response-123.mp3`)
- Handle cleanup of old audio files

### Phase 9: LLM Integration (Future)
**Updates to `internal/ai/bobai.go` and `internal/ai/aliceai.go`**
- Replace dummy responses with actual LLM calls
- Use Anthropic Claude or OpenAI API
- Implement prompt engineering:
  - Bob: Persona of curious questioner
  - Alice: Persona of knowledgeable answerer
- Maintain conversation history for context
- Handle API errors and retries

### Phase 10: Testing & Refinement
- Test with existing Bob and Alice web clients
- Verify WebSocket connections on correct ports
- Test conversation flow: Bob asks → Alice answers → Bob follows up
- Test reconnection scenarios
- Test with only one client connected
- Monitor goroutine leaks and channel deadlocks

## Dependencies

### Required Go Packages
```go
github.com/gorilla/websocket     // WebSocket implementation
github.com/gorilla/mux           // HTTP routing (optional)
```

### Future Dependencies (for full implementation)
```go
// AI/LLM SDK - choose one:
github.com/anthropics/anthropic-sdk-go
github.com/sashabaranov/go-openai

// Audio/TTS - TBD based on service choice
// May use external HTTP calls instead of SDK
```

## Configuration

### Environment Variables
```
ALICE_PORT=8003
BOB_PORT=8004
ANTHROPIC_API_KEY=sk-...
AUDIO_DIR=/public/audio
```

## Error Handling

### WebSocket Servers
- Log connection errors
- Gracefully handle client disconnections
- Automatically accept new connections after disconnect
- Validate JSON message format

### AI Components
- Handle channel closures
- Timeout for LLM API calls
- Fallback responses if LLM fails
- Rate limiting for API calls

### Channels
- Use buffered channels to prevent blocking
- Implement timeouts on channel operations
- Proper cleanup on shutdown

## Future Enhancements

1. **Persistence**: Save conversation history to database
2. **Multiple Conversations**: Support multiple concurrent conversations
3. **Web UI**: Admin interface to monitor conversations
4. **Audio Streaming**: Stream audio instead of serving files
5. **Voice Input**: Accept audio from clients and transcribe
6. **Conversation Controls**: Pause, restart, modify personas
7. **Metrics**: Prometheus metrics for monitoring
8. **Logging**: Structured logging with levels

## Testing Strategy

### Unit Tests
- Test message parsing/serialization
- Test channel communication patterns
- Mock LLM responses for AI component tests

### Integration Tests
- Test WebSocket server with mock clients
- Test full conversation flow with all components
- Test reconnection scenarios

### Manual Testing
- Connect actual Bob and Alice web clients
- Verify message delivery and audio playback
- Test various conversation scenarios

## Success Criteria

1. ✓ Bob client can connect to port 8004
2. ✓ Alice client can connect to port 8003
3. ✓ Bob can send initial message and receive response
4. ✓ Alice receives questions and can display them
5. ✓ Conversation flows: Bob → Alice → Bob (with context)
6. ✓ Audio files are generated and served correctly
7. ✓ Clients can reconnect after disconnection
8. ✓ No goroutine leaks or channel deadlocks
9. ✓ Graceful shutdown on SIGINT/SIGTERM

## Notes

- Start with scaffolding (dummy responses) to verify architecture
- Add LLM integration after basic flow works
- Add audio generation after LLM integration works
- Focus on one component at a time
- Test incrementally after each phase
- Keep components loosely coupled via channels
