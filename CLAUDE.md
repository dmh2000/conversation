# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This repository is a comparison project for evaluating different AI coding assistants. It contains identical prompts for building the same web application, with separate directories for implementations by different AI assistants (Alice and Bob). It also includes a Go-based AI server that orchestrates conversations between the two personas using Google Gemini.

## Project Structure

```
conversation/
├── ai-server/       # Go-based AI orchestration server (Gemini 2.5 Pro)
│   ├── cmd/         # Entry point (main.go)
│   ├── internal/    # Server, AI personas, logger, types
│   └── config/      # Environment-based configuration
├── alice/           # Implementation by Alice AI
│   ├── server/      # Node.js + Express + WebSocket server
│   └── client/      # Vite + React + TypeScript frontend
├── bob/             # Implementation by Bob AI
│   ├── server/      # Node.js + Express + WebSocket server
│   └── client/      # Vite + React + TypeScript frontend
├── prompts/         # Prompt specifications and plans
├── scripts/         # Build, deploy, and run scripts
│   └── nginx/       # Nginx configuration for scripts
├── proxy/           # Nginx reverse proxy configuration
├── test/            # Test utilities
│   └── ws/          # WebSocket testing
└── presentation/    # HTML/CSS presentation files
```

Each implementation (alice/, bob/) is self-contained with its own server and client subdirectories.

## Application Architecture

### Overview

**Full System Data Flow:**
```
User → Bob Client → ai-server → Gemini API → Alice AI → Alice Client
                  ↓                         ↓
              Bob AI ←──────────────────────┘
```

The ai-server orchestrates conversations between two AI personas (Bob and Alice), both powered by Google Gemini 2.5 Pro. Bob asks questions, Alice answers.

### AI Server (Go)

The `ai-server/` component is a Go-based WebSocket server that:
- Runs Bob AI on port 8004 and Alice AI on port 8003
- Uses channel-based concurrent architecture
- Integrates with Google Gemini 2.5 Pro via `go-llmclient`
- Maintains conversation context for both personas

**Port Configuration:**
- Alice WebSocket: 8003 (via `ALICE_PORT` env var)
- Bob WebSocket: 8004 (via `BOB_PORT` env var)

### Node.js Server Architecture (Legacy/Standalone)

Both alice/server and bob/server can operate independently for TCP-based message relay:

**Data Flow:** TCP Client → TCP Listener → WebSocket Server → React Web App → Display + Audio Playback

**Message Format:**
```json
{
  "text": "string",  // Text to display on web page
  "audio": "string"  // Path to MP3 audio file (relative path like "/audio/file.mp3")
}
```

**Alice Implementation:**
- Modular structure with separate files:
  - `index.ts` - Main entry point, Express app setup
  - `tcpListener.ts` - TCP server that receives JSON messages on port 8080
  - `websocketServer.ts` - WebSocket server for broadcasting to clients
  - `types.ts` - Shared TypeScript types
- TCP messages are parsed using brace-counting algorithm to handle streaming JSON
- Static files served from `/public` directory via `/audio` route

**Bob Implementation:**
- Monolithic structure with all logic in `index.ts`
- TCP server listens on port 8003
- WebSocket server integrated with HTTP server on port 3000
- Uses simpler indexOf-based JSON parsing

### Client Architecture

Both implementations use:
- **Vite** for build tooling
- **React 19** with TypeScript
- **WaveSurfer.js** for audio visualization and playback
- WebSocket client that connects to server and handles messages
- Start screen with button before connecting
- Connection status indicator

Key components:
- `App.tsx` - Main application component with start screen
- `MessageDisplay.tsx` - Displays received text messages
- `AudioPlayer.tsx` - Audio player with WaveSurfer visualization
- `websocketClient.ts` - WebSocket connection management hook

## Development Commands

### AI Server (Go)

```bash
cd ai-server

# Set required environment variable
export GOOGLE_API_KEY="your-api-key-here"

# Install dependencies
go mod tidy

# Build the server
go build -o ai-server ./cmd/main.go

# Run the server
./ai-server

# Or run directly for development
go run ./cmd/main.go
```

### Alice Implementation

**Server:**
```bash
cd alice/server
npm install          # Install dependencies
npm run dev          # Development mode with tsx watch
npm run build        # Compile TypeScript to dist/
npm start            # Run compiled JavaScript
```

**Client:**
```bash
cd alice/client
npm install          # Install dependencies
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Bob Implementation

**Server:**
```bash
cd bob/server
npm install          # Install dependencies
npm run dev          # Development mode with nodemon + ts-node
npm run build        # Compile TypeScript to dist/
npm start            # Run compiled JavaScript
```

**Client:**
```bash
cd bob/client
npm install          # Install dependencies
npm run dev          # Start Vite dev server (http://localhost:5174)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Scripts

The `scripts/` directory contains helper scripts:

```bash
# Build scripts
./scripts/build.sh       # Build all components

# Run scripts
./scripts/run.sh         # Run the full system
./scripts/local-run.sh   # Run locally
./scripts/local-kill.sh  # Kill local processes

# Deploy scripts
./scripts/deploy.sh      # Deploy to server

# Export scripts (for external demonstrations)
./scripts/export.sh
./scripts/export-start.sh
./scripts/export-kill.sh
```

## Port Configuration Summary

| Component | Port | Environment Variable |
|-----------|------|---------------------|
| Alice WebSocket (ai-server) | 8003 | `ALICE_PORT` |
| Bob WebSocket (ai-server) | 8004 | `BOB_PORT` |
| Alice HTTP/WS (Node.js) | 3000 | `PORT` |
| Alice TCP (Node.js) | 8080 | `TCP_PORT` |
| Bob HTTP/WS (Node.js) | 3000 | - |
| Bob TCP (Node.js) | 8003 | - |
| Alice Client (Vite) | 5173 | - |
| Bob Client (Vite) | 5174 | - |

## Key Technical Details

### AI Server (Go)

- Uses Google Gemini 2.5 Pro via `github.com/dmh2000/go-llmclient`
- Channel-based concurrent architecture for thread-safe message passing
- System prompts embedded via `//go:embed` from markdown files
- XML message format between AI personas for structured parsing

### TCP Message Parsing (Node.js servers)

Both implementations handle streaming TCP data where JSON messages may arrive in fragments:

- **Alice**: Uses brace-counting algorithm to track nested JSON objects and extract complete messages
- **Bob**: Uses indexOf to find opening/closing braces (simpler but may not handle nested objects correctly)

### Audio Handling

- Server serves static audio files from `public/` directory
- Client receives audio path in message (e.g., `/audio/file.mp3`)
- Alice client prepends server URL (`http://localhost:3000`) to relative paths
- WaveSurfer.js used for audio visualization and playback with auto-play enabled

### WebSocket Communication

- Server broadcasts received TCP messages to all connected WebSocket clients
- Client uses custom `useWebSocket` hook for connection management
- Connection status displayed in client UI
- Messages are JSON-stringified for transmission

## Working with This Repository

1. Each implementation (alice/, bob/) should remain self-contained
2. Refer to `prompts/` directory for original specifications
3. When modifying code, maintain consistency within each implementation's architecture
4. Alice uses modular server structure; Bob uses monolithic structure
5. Both clients use identical technology stack (Vite + React + TypeScript + WaveSurfer)
6. The ai-server orchestrates AI conversations between personas using Gemini
7. Use scripts in `scripts/` for common build/run/deploy operations
