# Antigravity Web App Implementation Plan

This plan outlines the steps to build the 'antigravity' web application as specified in `prompts/antigravity.md`.

## 1. Project Overview

The 'antigravity' application is a real-time messaging system that displays text and plays audio on a web page, triggered by messages received over a TCP connection.

### Architecture
*   **Root Directory**: `antigravity/`
*   **Frontend**: Vite + React + TypeScript
*   **Backend**: Node.js + Express
*   **Communication**:
    *   **TCP Client** -> **Backend (TCP Listener)**: Sends JSON messages.
    *   **Backend** -> **Frontend (WebSocket)**: Forwards messages.

### Data Flow
1.  A TCP client connects to the Backend's TCP port.
2.  The client sends a JSON message: `{"text": "...", "audio": "..."}`.
    *   Messages are delimited by opening `{` and closing `}` braces.
3.  The Backend validates the message.
4.  The Backend forwards the message to the connected Frontend via WebSocket.
5.  The Frontend receives the message.
6.  The Frontend displays the `text` and plays the mp3 file specified in `audio`.

## 2. Component Details

### 2.1. Directory Structure
All components will be placed in the `antigravity` directory.

```
antigravity/
├── backend/
│   ├── src/
│   │   ├── index.ts (or .js)   # Main server entry point
│   │   ├── tcpServer.ts        # TCP listener logic
│   │   └── websocketServer.ts  # WebSocket server logic
│   ├── package.json
│   └── tsconfig.json (if using TS)
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # Main React component
│   │   ├── components/
│   │   │   └── MessageDisplay.tsx # Component to show text
│   │   └── hooks/
│   │       └── useWebSocket.ts # Hook to handle WS connection
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

### 2.2. Backend Implementation
*   **Technology**: Node.js, Express.
*   **Dependencies**: `express`, `ws` (for WebSocket), `net` (built-in for TCP).
*   **Responsibilities**:
    1.  **HTTP Server**: Serve the frontend (optional, or just API).
    2.  **WebSocket Server**:
        *   Listen for incoming connections from the web app.
        *   Maintain a list of connected clients.
    3.  **TCP Listener**:
        *   Listen on a dedicated TCP port (e.g., 3001).
        *   **Protocol**: Raw TCP stream.
        *   **Parsing**: Buffer incoming data. Detect messages starting with `{` and ending with `}`.
        *   **Forwarding**: Parse the JSON. If valid, broadcast to all connected WebSocket clients.

### 2.3. Frontend Implementation
*   **Technology**: Vite, React, TypeScript.
*   **Responsibilities**:
    1.  **WebSocket Connection**: Connect to the backend WebSocket server on load.
    2.  **State Management**: Store the current `text` and `audio` URL.
    3.  **UI**:
        *   Display the `text` prominently.
        *   Hidden `<audio>` element or `Audio` object to play the sound.
    4.  **Audio Playback**:
        *   When a message arrives, update the audio source and attempt to play.
        *   *Note*: Browsers may block auto-play. The UI might need a "Start" button to enable audio context initially.

## 3. Implementation Steps

### Phase 1: Initialization
1.  Create the `antigravity` directory.
2.  **Backend**: Initialize `antigravity/backend` with `npm init`. Install `express`, `ws`, `nodemon`, `ts-node` (if TS).
3.  **Frontend**: Initialize `antigravity/frontend` with `npm create vite@latest . -- --template react-ts`.

### Phase 2: Backend Development
1.  Set up the Express server.
2.  Set up the WebSocket server (`ws`).
3.  Implement the TCP server (`net`).
    *   Implement the `{` ... `}` delimiter parsing logic.
4.  Integrate them: When TCP receives a complete JSON object, send it to `ws` clients.

### Phase 3: Frontend Development
1.  Create a basic UI layout.
2.  Implement `useWebSocket` hook to connect to the backend.
3.  Handle incoming messages:
    *   Set `text` state.
    *   Trigger audio playback.

### Phase 4: Verification
1.  Start Backend and Frontend.
2.  Open the web app.
3.  Use `netcat` or a custom script to send a TCP message:
    ```bash
    echo '{ "text": "Hello", "audio": "https://example.com/sound.mp3" }' | nc localhost 3001
    ```
4.  Verify text updates and audio plays.

## 4. Verification Plan

### Automated Tests
*   **Unit Tests**: Test the TCP buffer parser to ensure it correctly handles split packets or multiple packets in one chunk.
*   **Integration Test**: A script that starts the server, connects a WS client, connects a TCP client, sends data, and verifies the WS client receives it.

### Manual Verification
*   **Browser Test**: Open the app, click "Enable Audio" (if needed), and send commands via terminal.
*   **Edge Cases**:
    *   Malformed JSON.
    *   Partial TCP messages.
    *   Audio file not found.
