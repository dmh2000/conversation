# Development Plan for Gemini Web App

This plan outlines the steps to build the real-time messaging web application as specified in `prompts/gemini-app.md`.

## 1. Project Initialization & Structure

**Target Directory:** `gemini/`

We will create a monorepo-style structure within the `gemini` folder to keep the frontend and backend distinct but related.

```text
gemini/
├── client/         # Frontend (Vite + React + TypeScript)
│   ├── src/
│   ├── package.json
│   └── ...
├── server/         # Backend (Node + Express + WS + TCP)
│   ├── src/
│   │   └── server.ts
│   ├── package.json
│   └── ...
└── README.md       # Instructions for running the app
```

## 2. Component Specifications

### 2.1 Backend (`server/`)

**Technologies:** Node.js, Express, `ws` (WebSocket), `net` (TCP built-in).

**Responsibilities:**
1.  **HTTP Server:** Serve the static frontend files (production mode) or just act as the API layer. *Dev Note: During development, we will likely run the frontend on a separate Vite port (e.g., 5173) and the backend on another (e.g., 3000).*
2.  **WebSocket Server:** Listen for incoming connections from the React client.
3.  **TCP Server:** Listen on a dedicated raw TCP port for external triggers.

**Logic Flow (TCP to WebSocket):**
1.  TCP Server listens on port `3001` (configurable).
2.  On `connection`: Log new TCP client.
3.  On `data`:
    *   Accumulate incoming data into a buffer.
    *   Scan for opening `{` and closing `}` braces to identify a complete message.
    *   Extract the JSON string between braces.
    *   Parse JSON: `{ "text": "...", "audio": "..." }`.
    *   Validate format.
    *   **Forward:** Iterate through all active WebSocket clients and send the parsed JSON object.

### 2.2 Frontend (`client/`)

**Technologies:** Vite, React, TypeScript.

**Responsibilities:**
1.  **UI Layout:** A simple, clean interface to display the received text.
2.  **WebSocket Client:**
    *   Connect to `ws://localhost:3000` (or backend port) on mount.
    *   Handle `onopen`, `onmessage`, `onclose`, `onerror`.
3.  **Message Handling:**
    *   Update React state `displayMessage` with the `text` field.
    *   Trigger audio playback using the `audio` field (URL).
4.  **Audio Playback:**
    *   Use the HTML5 `<audio>` element or JavaScript `Audio` API.
    *   Ensure the audio path is accessible (if relative, it might need to be served by the backend or public folder). *Assumption: The 'audio' string is a URL or a path relative to the public root.*

## 3. Step-by-Step Implementation Plan

### Phase 1: Setup
1.  Create `gemini` directory.
2.  Initialize `gemini/server` with `npm init -y`.
3.  Install backend dependencies: `express`, `ws`, `@types/ws`, `@types/express`, `@types/node`, `typescript`, `ts-node`, `nodemon`.
4.  Initialize `gemini/client` using `npm create vite@latest client -- --template react-ts`.
5.  Install frontend dependencies (`npm install`).

### Phase 2: Backend Implementation
1.  Create `gemini/server/src/index.ts`.
2.  **Step 2a (HTTP & WS):** Set up Express and attach a `WebSocketServer` to it.
3.  **Step 2b (TCP):** Use `net.createServer()` to listen on a separate port (e.g., 3001).
4.  **Step 2c (Integration):** Implement the buffering logic to parse `{ JSON }` from the TCP stream and broadcast it to `wss.clients`.
5.  **Step 2d (Test):** Create a simple test script (Node.js script or using `netcat`) to send a mock TCP message and verify the console logs.

### Phase 3: Frontend Implementation
1.  Update `gemini/client/src/App.tsx`.
2.  Add state: `const [message, setMessage] = useState<string>('')`.
3.  Add `useEffect` to establish the WebSocket connection.
4.  On `message` event:
    *   `JSON.parse(event.data)`.
    *   `setMessage(data.text)`.
    *   `new Audio(data.audio).play()` (Handle potential browser autoplay policies).
5.  Add basic styling (CSS) to make the text large and readable.

### Phase 4: Integration & Verification
1.  Start Backend: `npm run dev` (server).
2.  Start Frontend: `npm run dev` (client).
3.  Open Browser: `http://localhost:5173`.
4.  **Trigger:** Run a TCP client script to send:
    ```
    { "text": "Hello World", "audio": "https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav" }
    ```
    *(Note: Using a publicly available WAV/MP3 for testing first)*
5.  **Verify:**
    *   Browser displays "Hello World".
    *   Audio plays.

## 4. Testing Tools
*   **TCP Test Script:** We will create a `scripts/test-tcp.js` in the server folder to simulate the external TCP client.
