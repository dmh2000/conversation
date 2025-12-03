# AI Server

A Go-based WebSocket server that orchestrates a conversation between two AI personas powered by Google Gemini 2.5 Pro: Bob (who asks questions) and Alice (who answers questions). The server uses a concurrent, channel-based architecture for real-time, bidirectional communication.

## Architecture

The server consists of 6 main components:

### WebSocket Servers
- **BobServer**: WebSocket server on port 3002 for Bob web client connections
- **AliceServer**: WebSocket server on port 3001 for Alice web client connections

### AI Personas
- **Bob AI**: LLM-powered persona that generates follow-up questions based on conversation context
- **Alice AI**: LLM-powered persona that answers questions with contextual awareness

### Supporting Components
- **Logger**: Custom logging package with file:line information
- **Types**: Shared message types and structures

**Communication**: All components communicate via Go channels for thread-safe, concurrent message passing.

## Project Structure

```
ai-server/
├── cmd/
│   └── main.go                 # Entry point and orchestration
├── internal/
│   ├── server/
│   │   ├── aliceserver.go      # Alice WebSocket server (port 3001)
│   │   └── bobserver.go        # Bob WebSocket server (port 3002)
│   ├── ai/
│   │   ├── aliceai.go          # Alice AI persona with LLM integration
│   │   ├── alice-system.md     # Alice system prompt (embedded)
│   │   ├── bobai.go            # Bob AI persona with LLM integration
│   │   └── bob-system.md       # Bob system prompt (embedded)
│   ├── logger/
│   │   └── logger.go           # Custom logger with file:line info
│   └── types/
│       └── message.go          # Shared message types
├── config/
│   └── config.go               # Environment-based configuration
├── go.mod                      # Go module dependencies
├── go.sum                      # Dependency checksums
└── ai-server                   # Compiled binary
```

## Prerequisites

- **Go 1.25.3** or later
- **Google Cloud API Key** with Gemini API access (set via `GOOGLE_API_KEY` environment variable)
- **Network Access**: Ports 3001 and 3002 available for WebSocket servers

## Building

```bash
# Install dependencies
go mod tidy

# Build the server binary
go build -o ai-server ./cmd/main.go

# The binary will be created in the current directory
```

## Running

```bash
# Set your Google Cloud API key (required for LLM integration)
export GOOGLE_API_KEY="your-api-key-here"

# Run the compiled binary
./ai-server

# Or run directly with go (useful for development)
go run ./cmd/main.go
```

**Expected Output:**
```
[cmd/main.go:17] Starting AI Server...
[cmd/main.go:21] Configuration: Alice port=3001, Bob port=3002
[internal/ai/aliceai.go:51] Alice AI started
[internal/ai/bobai.go:49] Bob AI started
[cmd/main.go:67] AI Server is running. Press Ctrl+C to stop.
```

## Configuration

Environment variables:

**Required:**
- `GOOGLE_API_KEY`: Google Cloud API key for Gemini API access

**Optional:**
- `ALICE_PORT`: Port for Alice WebSocket server (default: 3001)
- `BOB_PORT`: Port for Bob WebSocket server (default: 3002)
- `CHANNEL_BUFFER`: Buffer size for Go channels (default: 10)

**Example:**
```bash
export GOOGLE_API_KEY="AIza..."
export ALICE_PORT=3001
export BOB_PORT=3002
export CHANNEL_BUFFER=10
```

## Message Format

### WebSocket Messages (Client ↔ Server)

WebSocket clients communicate with JSON messages:

```json
{
  "text": "Message text"
}
```

**Client → Server (Bob only):**
```json
{
  "text": "What is quantum computing?"
}
```

**Server → Client:**
```json
{
  "text": "Quantum computing is a type of computation that harnesses quantum mechanical phenomena..."
}
```

### Internal AI Communication (Bob ↔ Alice)

AI personas communicate using XML format for structured parsing:

**Bob's Questions:**
```xml
<bob>What is quantum computing?</bob>
```

**Alice's Answers:**
```xml
<alice>Quantum computing is a type of computation that harnesses quantum mechanical phenomena...</alice>
```

**Error Messages:**
```xml
<error>
  <message_id>1</message_id>
  <timestamp>2025-12-01T19:39:10Z</timestamp>
  <content>Clarify your question: I need more detail about the topic you're asking.</content>
</error>
```

The server automatically converts between JSON (for web clients) and XML (for AI personas).

## Testing with Web Clients

### 1. Start the AI Server

```bash
# Set API key
export GOOGLE_API_KEY="your-api-key-here"

# Start server
./ai-server
```

Server should output:
```
[cmd/main.go:67] AI Server is running. Press Ctrl+C to stop.
```

### 2. Start the Alice Web Client

In a new terminal:
```bash
cd ../alice/client
npm run dev
```

Alice client will be available at `http://localhost:5173`

### 3. Start the Bob Web Client

In another new terminal:
```bash
cd ../bob/client
npm run dev
```

Bob client will be available at `http://localhost:5174`

### 4. Initiate Conversation

1. Open Bob client in browser (`http://localhost:5174`)
2. Type a question in the textarea (e.g., "What is quantum computing?")
3. Click "Go Ask Alice"
4. Bob AI processes the question and forwards to Alice AI
5. Alice AI generates a response using Gemini 2.5 Pro
6. Response appears in Bob client
7. Bob AI generates follow-up questions automatically
8. Open Alice client (`http://localhost:5173`) to see Alice's perspective

**Connection Details:**
- Bob client ↔ BobServer: WebSocket on port 3002
- Alice client ↔ AliceServer: WebSocket on port 3001
- Bob AI ↔ Alice AI: Go channels (internal)

## Current Implementation Status

### Completed Features ✅

- **WebSocket Servers**: Fully functional servers for Alice (3001) and Bob (3002)
- **Channel-based Architecture**: Concurrent, thread-safe communication via Go channels
- **LLM Integration**: Google Gemini 2.5 Pro integration via go-llmclient
- **Conversation Context**: Both AI personas maintain conversation history
- **System Prompts**: Embedded markdown system prompts for persona behavior
- **XML Message Format**: Structured communication between AI personas
- **Response Validation**: XML validation for AI-generated responses
- **Custom Logger**: File:line logging for debugging
- **Graceful Shutdown**: Context-based shutdown handling
- **Environment Configuration**: Flexible port and buffer configuration

### In Progress / Planned 🚧

- **Conversation Persistence**: Save conversation history to database
- **Multi-session Support**: Handle multiple concurrent conversations
- **Audio Generation**: Text-to-speech for responses (removed from current scope)
- **Advanced Error Handling**: More robust error recovery and retry logic
- **Metrics & Monitoring**: Performance metrics and health checks
- **Rate Limiting**: API rate limiting for LLM calls

## Technical Details

### LLM Integration

The server uses **Google Gemini 2.5 Pro** via the `go-llmclient` library:

- **Model**: `gemini-2.5-pro`
- **Client Library**: `github.com/dmh2000/go-llmclient v1.0.0`
- **Context Management**: Both personas maintain conversation history
- **System Prompts**: Embedded from markdown files using `//go:embed`

**Alice AI Workflow:**
1. Receives question from Bob AI (via channel)
2. Adds question to conversation context
3. Queries Gemini 2.5 Pro with system prompt + context
4. Validates XML response format
5. Sends response to Alice client and Bob AI

**Bob AI Workflow:**
1. Receives initial question from Bob client (via WebSocket)
2. Forwards to Alice AI with XML formatting
3. Receives Alice's answer (via channel)
4. Queries Gemini 2.5 Pro to generate follow-up question
5. Validates XML response format
6. Sends follow-up to Alice AI and updates Bob client

### Concurrency Model

```
┌─────────────┐
│  BobServer  │ Port 3002
└──────┬──────┘
       │ channel (bobServerToAI)
       ▼
┌─────────────┐
│   Bob AI    │ Goroutine
└──────┬──────┘
       │ channel (bobToAlice)
       ▼
┌─────────────┐
│  Alice AI   │ Goroutine
└──────┬──────┘
       │ channel (aliceAIToServer)
       ▼
┌─────────────┐
│ AliceServer │ Port 3001
└─────────────┘
```

**Channels:**
- `bobServerToAI`: Bob WebSocket → Bob AI (initial questions)
- `bobAIToServer`: Bob AI → Bob WebSocket (responses to display)
- `bobToAlice`: Bob AI → Alice AI (questions)
- `aliceToBob`: Alice AI → Bob AI (answers)
- `aliceServerToAI`: Alice WebSocket → Alice AI (unused)
- `aliceAIToServer`: Alice AI → Alice WebSocket (responses to display)

### Dependencies

**Main Dependencies:**
- `github.com/dmh2000/go-llmclient v1.0.0` - LLM client wrapper for Gemini
- `github.com/gorilla/websocket v1.5.3` - WebSocket implementation

**Indirect Dependencies (via go-llmclient):**
- Google Cloud AI Platform SDK
- Google Generative AI Go SDK
- OpenTelemetry instrumentation
- OAuth2 and authentication libraries

See `go.mod` for complete dependency list.

## Troubleshooting

### "GOOGLE_API_KEY not set" Error

**Problem:** Server crashes or AI responses fail
**Solution:** Export your Google Cloud API key:
```bash
export GOOGLE_API_KEY="your-api-key-here"
```

### WebSocket Connection Refused

**Problem:** Clients can't connect to server
**Solution:**
- Verify server is running: Look for "AI Server is running" message
- Check ports are not in use: `lsof -i :3001` and `lsof -i :3002`
- Verify firewall settings

### AI Responses Not Generating

**Problem:** Messages sent but no AI responses
**Solution:**
- Check server logs for errors
- Verify GOOGLE_API_KEY is valid
- Check Google Cloud API quotas
- Ensure internet connectivity for Gemini API calls

### Channel Full Warnings

**Problem:** Logs show "channel full, dropping message"
**Solution:** Increase `CHANNEL_BUFFER` environment variable:
```bash
export CHANNEL_BUFFER=50
```

## Development

### Adding New Features

1. **Modify AI Behavior**: Edit system prompts in `internal/ai/*-system.md`
2. **Add New Message Types**: Update `internal/types/message.go`
3. **Extend Logging**: Use `logger.Printf()` or `logger.Println()`
4. **Test Changes**: Run with `go run ./cmd/main.go`

### Testing

```bash
# Run the server
go run ./cmd/main.go

# In another terminal, check WebSocket endpoints
wscat -c ws://localhost:3002  # Bob server
wscat -c ws://localhost:3001  # Alice server
```

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                         AI Server                             │
│                                                                │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────┐      │
│  │  BobServer  │───▶│   Bob AI     │───▶│  Alice AI   │      │
│  │  (Port 3002)│◀───│  (Goroutine) │◀───│ (Goroutine) │      │
│  └──────┬──────┘    └──────────────┘    └──────┬──────┘      │
│         │                                        │             │
│         │                                        │             │
│  ┌──────▼──────┐                         ┌──────▼──────┐      │
│  │ WebSocket   │                         │ WebSocket   │      │
│  │   Client    │                         │   Client    │      │
│  └─────────────┘                         └─────────────┘      │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐     │
│  │           Google Gemini 2.5 Pro (via API)            │     │
│  └──────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘

External Components:
┌─────────────┐                              ┌─────────────┐
│ Bob Client  │                              │Alice Client │
│ (React App) │                              │ (React App) │
│  Port 5174  │                              │  Port 5173  │
└─────────────┘                              └─────────────┘
```
