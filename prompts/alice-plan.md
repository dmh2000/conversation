# Implementation Plan for WebSocket Messaging App

## Analysis of Specification

The specification has been reviewed and contains **no errors or inconsistencies**. The architecture is well-defined:

- **Data Flow**: TCP Client → TCP Listener → WebSocket Server → React Web App
- **Message Format**: Clear JSON structure with text and audio fields
- **Technology Stack**: Consistent (Vite/React/TypeScript for frontend, Node/Express for backend)
- **Message Delimiting**: Using braces for TCP message parsing is appropriate for JSON

## Project Structure
```
claude/
├── server/
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts           # Main server entry point
│   │   ├── tcpListener.ts     # TCP server for external messages
│   │   ├── websocketServer.ts # WebSocket server
│   │   └── types.ts           # Shared TypeScript types
│   └── public/                # Static files (mp3 files)
└── client/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── main.tsx           # App entry point
        ├── App.tsx            # Main React component
        ├── components/
        │   ├── MessageDisplay.tsx  # Text display component
        │   └── AudioPlayer.tsx     # Audio playback component
        └── services/
            └── websocketClient.ts  # WebSocket connection handler
```

## Implementation Steps

### Phase 1: Server Setup

#### 1. Initialize Server Project (`claude/server/`)
- Run `npm init -y`
- Install dependencies: `express`, `ws` (WebSocket library), `net` (built-in Node.js)
- Install dev dependencies: `typescript`, `@types/node`, `@types/express`, `@types/ws`, `tsx`, `nodemon`
- Configure TypeScript with `tsconfig.json`

#### 2. Define Message Types (`server/src/types.ts`)
```typescript
interface Message {
  text: string;
  audio: string;
}
```

#### 3. Create Express Server (`server/src/index.ts`)
- Set up Express app
- Serve static files (for mp3 files)
- Configure CORS if needed
- Start HTTP server on port (e.g., 3000)

#### 4. Implement WebSocket Server (`server/src/websocketServer.ts`)
- Create WebSocket server attached to HTTP server
- Handle client connections
- Broadcast messages to all connected clients
- Export broadcast function for use by TCP listener

#### 5. Implement TCP Listener (`server/src/tcpListener.ts`)
- Create TCP server on separate port (e.g., 8080)
- Listen for incoming connections
- Parse incoming data stream for complete JSON messages
- Use opening/closing braces `{` and `}` to delimit messages
- Handle incomplete messages across multiple data chunks
- Validate JSON message format
- Forward valid messages to WebSocket server

### Phase 2: Client Setup

#### 6. Initialize Client Project (`claude/client/`)
- Run `npm create vite@latest . -- --template react-ts`
- Install additional dependencies if needed
- Configure Vite for development

#### 7. Create WebSocket Client Service (`client/src/services/websocketClient.ts`)
- Establish WebSocket connection to server
- Handle connection events (open, close, error)
- Parse incoming messages
- Provide hooks/callbacks for message handling
- Reconnection logic for robustness

#### 8. Create Message Display Component (`client/src/components/MessageDisplay.tsx`)
- Accept text prop
- Display text in UI
- Handle text updates
- Styling for readability

#### 9. Create Audio Player Component (`client/src/components/AudioPlayer.tsx`)
- Accept audio file path prop
- Create HTML5 `<audio>` element
- Load and play MP3 file when path changes
- Handle audio errors
- Optional: Show playback controls

#### 10. Create Main App Component (`client/src/App.tsx`)
- Initialize WebSocket connection
- Manage message state (text and audio path)
- Render MessageDisplay and AudioPlayer components
- Pass received message data to child components

### Phase 3: Integration & Testing

#### 11. Development Scripts
- Server: `npm run dev` (using nodemon/tsx for hot reload)
- Client: `npm run dev` (Vite dev server)
- Ensure proper port configuration

#### 12. Testing Strategy
- Create test MP3 files in server's public directory
- Create TCP client test script to send messages:
  ```javascript
  // Send test message via TCP
  const net = require('net');
  const client = net.createConnection({ port: 8080 }, () => {
    const message = JSON.stringify({
      text: "Hello World",
      audio: "/test.mp3"
    });
    client.write(message);
    client.end();
  });
  ```
- Verify complete data flow: TCP → WebSocket → Browser
- Test edge cases: large messages, rapid messages, invalid JSON

#### 13. Configuration Files
- `.env` files for port configuration
- README with setup and run instructions
- Package.json scripts for build and dev

## Technical Considerations

- **TCP Message Parsing**: Implement buffer accumulation to handle messages split across multiple TCP packets
- **WebSocket Protocol**: Use standard WebSocket (ws library) for simplicity
- **Audio Paths**: Serve MP3 files statically from Express server
- **CORS**: Configure if client and server run on different ports
- **Error Handling**: Validate message format, handle missing audio files gracefully
- **State Management**: React useState for simple message state (no need for Redux/Context for this scope)

## Message Format

```json
{
  "text": "string",  // Text to be displayed on the web page
  "audio": "string"  // Path to MP3 audio file
}
```

## Data Flow

```
TCP Client → TCP Listener (Port 8080) → WebSocket Server → React Web App
                                              ↓
                                         Broadcast to connected clients
                                              ↓
                                    Display Text + Play Audio
```
