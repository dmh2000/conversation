# AI Server

A Go-based WebSocket server that simulates a conversation between two AI personas: Bob (who asks questions) and Alice (who answers questions).

## Architecture

The server consists of 4 main components:
- **BobServer**: WebSocket server listening on port 3002 for Bob web client
- **BobAI**: Goroutine simulating Bob persona (asks questions)
- **AliceServer**: WebSocket server listening on port 3001 for Alice web client
- **AliceAI**: Goroutine simulating Alice persona (answers questions)

Components communicate via Go channels for a clean, concurrent architecture.

## Project Structure

```
ai-server/
├── cmd/
│   └── main.go              # Entry point and orchestration
├── internal/
│   ├── server/
│   │   ├── aliceserver.go   # Alice WebSocket server
│   │   └── bobserver.go     # Bob WebSocket server
│   ├── ai/
│   │   ├── aliceai.go       # Alice AI persona
│   │   └── bobai.go         # Bob AI persona
│   └── types/
│       └── message.go       # Shared types
├── config/
│   └── config.go            # Configuration
└── public/
    └── audio/               # Audio files (future)
```

## Building

```bash
# Install dependencies
go mod tidy

# Build the server
go build -o ai-server ./cmd/main.go
```

## Running

```bash
# Run with default configuration
./ai-server

# Or run directly with go
go run ./cmd/main.go
```

## Configuration

Environment variables (all optional):
- `ALICE_PORT`: Port for Alice WebSocket server (default: 3001)
- `BOB_PORT`: Port for Bob WebSocket server (default: 3002)
- `AUDIO_DIR`: Directory for audio files (default: ./public/audio)
- `CHANNEL_BUFFER`: Buffer size for Go channels (default: 10)

## Message Format

WebSocket messages are JSON:
```json
{
  "text": "Message text",
  "audio": "/audio/file.mp3"
}
```

## Testing with Web Clients

1. Start the AI server:
   ```bash
   ./ai-server
   ```

2. Start the Alice web client (in alice/client directory):
   ```bash
   npm run dev
   ```

3. Start the Bob web client (in bob/client directory):
   ```bash
   npm run dev
   ```

4. The Bob client connects to port 3002
5. The Alice client connects to port 3001
6. Send a message from Bob to initiate the conversation

## Current Implementation Status

- ✅ WebSocket servers for Alice and Bob
- ✅ Channel-based communication between components
- ✅ Basic message routing
- ✅ Dummy AI responses (scaffolding)
- ⏳ LLM integration (planned)
- ⏳ Audio generation (planned)

## Future Enhancements

1. **LLM Integration**: Replace dummy responses with actual AI-generated content
2. **Audio Generation**: Add text-to-speech for audio responses
3. **Conversation Context**: Maintain conversation history
4. **Multiple Conversations**: Support concurrent conversation sessions
5. **Persistence**: Save conversation history to database
