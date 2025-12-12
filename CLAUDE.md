# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This repository is a comparison project for evaluating different AI coding assistants. It contains identical prompts for building the same web application, with separate directories for implementations by different AI assistants (Alice and Bob).

## Project Structure

```
conversation/
├── alice/           # Implementation by Alice AI
│   ├── server/      # Node.js + Express + WebSocket server
│   └── client/      # Vite + React + TypeScript frontend
├── bob/             # Implementation by Bob AI
│   ├── server/      # Node.js + Express + WebSocket server
│   └── client/      # Vite + React + TypeScript frontend
├── prompts/         # Prompt specifications and plans
└── antigravity/     # Additional implementation
```

Each implementation (alice/, bob/) is self-contained with its own server and client subdirectories.

## Application Architecture

**Data Flow:** TCP Client → TCP Listener → WebSocket Server → React Web App → Display + Audio Playback

**Message Format:**
```json
{
  "text": "string",  // Text to display on web page
  "audio": "string"  // Path to MP3 audio file (relative path like "/audio/file.mp3")
}
```

### Server Architecture

Both implementations follow a similar pattern but with different code organization:

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
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

## Key Technical Details

### TCP Message Parsing

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

### Port Configuration

**Alice:**
- HTTP/WebSocket: 3000 (configurable via PORT env var)
- TCP: 8080 (configurable via TCP_PORT env var)

**Bob:**
- HTTP/WebSocket: 3000
- TCP: 8003

## Working with This Repository

1. Each implementation (alice/, bob/) should remain self-contained
2. Refer to `prompts/` directory for original specifications
3. When modifying code, maintain consistency within each implementation's architecture
4. Alice uses modular server structure; Bob uses monolithic structure
5. Both clients use identical technology stack (Vite + React + TypeScript + WaveSurfer)
