# Alice Client

Alice is a React-based web application that displays answers from the Alice AI persona. It connects to the AI Server via WebSocket and provides a clean interface for viewing text responses and playing audio.

## Architecture

```
Alice Client → WebSocket (Port 8003) → AI Server → Alice AI Persona
                                             ↓
                                        Receives questions
                                        Generates answers
```

## Features

- ✅ Real-time WebSocket communication with AI Server
- ✅ Audio playback with WaveSurfer visualization
- ✅ Connection status indicator
- ✅ Automatic reconnection on disconnect
- ✅ Start screen with connection button
- ✅ Modern, clean UI
- ✅ TypeScript for type safety
- ✅ Responsive design

## Project Structure

```
alice/client/
├── src/
│   ├── App.tsx                    # Main application component
│   ├── components/
│   │   ├── MessageDisplay.tsx     # Text message display
│   │   └── AudioPlayer.tsx        # Audio player with visualization
│   ├── services/
│   │   └── websocketClient.ts     # WebSocket connection handler
│   ├── App.css                    # Styling
│   └── main.tsx                   # Application entry point
├── public/                        # Static assets
├── index.html
├── package.json
└── vite.config.ts
```

## Setup and Installation

### Prerequisites

- Node.js 18+ and npm
- AI Server running on port 8003

### Install Dependencies

```bash
cd alice/client
npm install
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will start on `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Configuration

### WebSocket URL

The WebSocket connection URL can be configured via environment variable:

```bash
VITE_WS_URL=ws://localhost:8003 npm run dev
```

Default: `ws://localhost:8003`

Configuration is in `src/services/websocketClient.ts`:

```typescript
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8003';
```

## Usage

1. **Start the AI Server**:
   ```bash
   cd ../../ai-server
   ./ai-server
   ```

2. **Start Alice Client**:
   ```bash
   npm run dev
   ```

3. **Open in Browser**:
   Navigate to `http://localhost:5173`

4. **Connect**:
   Click the "Start" button to establish WebSocket connection

5. **Receive Messages**:
   Alice will display questions and answers from the conversation

## Message Format

The client expects JSON messages from the AI Server:

```json
{
  "text": "Answer text to display",
  "audio": "/audio/response.mp3"
}
```

- `text`: The text content to display
- `audio`: URL path to audio file (server URL is auto-prepended)

## Components

### App.tsx

Main application component that handles:
- Connection state management
- Message reception
- Start screen display
- Status indicator

### MessageDisplay.tsx

Displays received text messages with:
- Clean typography
- Fade-in animations
- Accessible markup

### AudioPlayer.tsx

Audio playback component featuring:
- WaveSurfer.js visualization
- Auto-play functionality
- Loading states
- Error handling

### websocketClient.ts

Custom hook for WebSocket management:
- Automatic connection
- Auto-reconnection on disconnect
- Message parsing
- Connection state tracking

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Quality

- TypeScript for type safety
- ESLint for code quality
- React 19 best practices
- Modern hooks-based architecture

## Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **WaveSurfer.js** - Audio visualization
- **WebSocket API** - Real-time communication

## Styling

The application uses modern CSS with:
- CSS Grid and Flexbox layouts
- CSS custom properties (variables)
- Smooth animations and transitions
- Responsive design
- Accessible color contrast

## Accessibility

- ARIA labels and roles
- Live regions for dynamic content
- Keyboard navigation support
- Screen reader friendly
- Semantic HTML

## Troubleshooting

### Cannot Connect to WebSocket

- Ensure AI Server is running: `cd ../../ai-server && ./ai-server`
- Check that port 8003 is not blocked by firewall
- Verify WebSocket URL in browser console

### Audio Not Playing

- Check that audio paths are valid
- Verify server is serving audio files correctly
- Check browser console for errors
- Ensure browser allows auto-play

### Blank Screen

- Check browser console for errors
- Verify all dependencies are installed: `npm install`
- Try clearing the Vite cache: `rm -rf node_modules/.vite`

## Integration with AI Server

Alice client integrates with the AI Server architecture:

1. Connects to AliceServer WebSocket (port 8003)
2. Receives messages from Alice AI persona
3. Displays text and plays audio
4. Maintains connection with auto-reconnect

The Alice AI persona on the server:
- Receives questions from Bob AI
- Generates intelligent answers (future LLM integration)
- Sends responses to Alice client with audio

## Future Enhancements

- Voice input for sending messages to Alice AI
- Conversation history display
- Theme customization
- Multi-language support
- Enhanced audio controls (pause, seek, volume)
- Message search and filtering
