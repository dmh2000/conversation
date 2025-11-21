# WebSocket Messaging App

A real-time messaging application that receives JSON messages via TCP, forwards them through a WebSocket server, and displays them in a React web app with text display and audio playback.

## Architecture

```
TCP Client → TCP Listener (Port 8080) → WebSocket Server → React Web App
                                              ↓
                                         Broadcast to clients
                                              ↓
                                    Display Text + Play Audio
```

## Message Format

```json
{
  "text": "string",  // Text to be displayed on the web page
  "audio": "string"  // Path to MP3 audio file (e.g., "/audio/test.mp3")
}
```

## Project Structure

```
claude/
├── server/              # Node.js backend server
│   ├── src/
│   │   ├── index.ts           # Main server entry point
│   │   ├── tcpListener.ts     # TCP server for external messages
│   │   ├── websocketServer.ts # WebSocket server
│   │   └── types.ts           # Shared TypeScript types
│   ├── public/                # Static MP3 files
│   ├── test-tcp-client.js     # Test script to send messages
│   └── package.json
└── client/              # React + TypeScript frontend
    ├── src/
    │   ├── App.tsx                    # Main App component
    │   ├── components/
    │   │   ├── MessageDisplay.tsx     # Text display component
    │   │   └── AudioPlayer.tsx        # Audio playback component
    │   └── services/
    │       └── websocketClient.ts     # WebSocket connection handler
    └── package.json
```

## Setup and Installation

### Server

```bash
cd server
npm install
```

### Client

```bash
cd client
npm install
```

## Running the Application

### Start the Server

```bash
cd server
npm run dev
```

The server will start on:
- HTTP/WebSocket: `http://localhost:3000`
- TCP Listener: `localhost:8080`

### Start the Client

In a new terminal:

```bash
cd client
npm run dev
```

The client will start on `http://localhost:5173`

## Testing

### Add MP3 Files

Place your MP3 audio files in the `server/public/` directory.

### Send Test Messages

Use the included test script to send messages via TCP:

```bash
cd server
node test-tcp-client.js "Hello World!" "/audio/test.mp3"
```

Or without arguments to send a default test message:

```bash
node test-tcp-client.js
```

### Manual Testing with Netcat

You can also use netcat to send JSON messages:

```bash
echo '{"text":"Test message","audio":"/audio/test.mp3"}' | nc localhost 8080
```

## How It Works

1. **TCP Client** sends a JSON message to the TCP listener on port 8080
2. **TCP Listener** parses the message using brace delimiters `{}`
3. **WebSocket Server** receives the parsed message and broadcasts it to all connected web clients
4. **React Web App**:
   - Receives the message via WebSocket
   - Displays the text in the MessageDisplay component
   - Loads and plays the MP3 file specified in the audio field

## Environment Variables

### Server

- `PORT`: HTTP server port (default: 3000)
- `TCP_PORT`: TCP listener port (default: 8080)

### Client

- `VITE_WS_URL`: WebSocket server URL (default: ws://localhost:3000)

## Building for Production

### Server

```bash
cd server
npm run build
npm start
```

### Client

```bash
cd client
npm run build
```

The built files will be in `client/dist/` and can be served by any static file server.

## Features

- ✅ Real-time WebSocket communication
- ✅ TCP message reception with brace-delimited JSON parsing
- ✅ Automatic audio playback
- ✅ Connection status indicator
- ✅ Automatic reconnection on disconnect
- ✅ TypeScript for type safety
- ✅ Clean, modern UI with React

## Technologies Used

- **Backend**: Node.js, Express, WebSocket (ws), TypeScript
- **Frontend**: React, TypeScript, Vite
- **Communication**: WebSocket, TCP/IP
