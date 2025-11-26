# Bob Client

Bob is a React-based web application that allows users to send questions to Alice through the AI Server. It features an input interface for composing questions and displays responses from the conversation.

## Architecture

```
Bob Client → WebSocket (Port 3002) → AI Server → Bob AI Persona
                                             ↓
                                        Sends questions to Alice
                                        Receives answers
```

## Features

- ✅ Real-time WebSocket communication with AI Server
- ✅ Text input with word count (256 word limit)
- ✅ Auto-expanding textarea
- ✅ Audio playback with WaveSurfer visualization
- ✅ Connection status indicator
- ✅ Start screen with "Go Ask Alice" button
- ✅ Modern, clean UI
- ✅ TypeScript for type safety
- ✅ Responsive design

## Project Structure

```
bob/client/
├── src/
│   ├── App.tsx                    # Main application component
│   ├── components/
│   │   └── AudioPlayer.tsx        # Audio player with visualization
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
- AI Server running on port 3002

### Install Dependencies

```bash
cd bob/client
npm install
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will start on `http://localhost:5174` (or 5173 if available)

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

The WebSocket connection URL is configured in `src/App.tsx`:

```typescript
const ws = new WebSocket('ws://localhost:3002');
```

To change the port, edit line 28 in `src/App.tsx`.

## Usage

1. **Start the AI Server**:
   ```bash
   cd ../../ai-server
   ./ai-server
   ```

2. **Start Bob Client**:
   ```bash
   npm run dev
   ```

3. **Open in Browser**:
   Navigate to `http://localhost:5174`

4. **Compose Question**:
   - Type your question in the textarea
   - Watch the word counter (max 256 words)
   - The textarea auto-expands as you type

5. **Send to Alice**:
   - Click "Go Ask Alice" to send your question
   - The client connects to the AI Server
   - Bob AI processes your question and forwards to Alice

6. **View Response**:
   - Responses from the conversation appear in the main area
   - Audio plays automatically if included

## Message Format

### Sending to Server

Bob sends JSON messages to the AI Server:

```json
{
  "text": "User's question text"
}
```

### Receiving from Server

Bob receives JSON responses:

```json
{
  "text": "Response text from conversation",
  "audio": "/audio/response.mp3"
}
```

- `text`: The response text to display
- `audio`: URL path to audio file

## Components

### App.tsx

Main application component that handles:
- WebSocket connection management
- Message sending and receiving
- Connection state tracking
- Input handling with word count
- Start screen display
- Status indicator

### AudioPlayer.tsx

Audio playback component featuring:
- WaveSurfer.js visualization
- Auto-play functionality
- Loading states
- Error handling

## User Interface

### Start Screen

- Clean, centered layout
- Large "Bob" title
- Auto-expanding textarea for question composition
- Word counter with visual feedback near limit
- "Go Ask Alice" button
- Button disabled until text is entered

### Main Screen

- Header with "Bob" title
- Connection status indicator (connected/disconnected)
- Message display area
- Audio player with waveform visualization
- Clean, modern styling

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
- Gradient backgrounds
- Responsive design
- Accessible color contrast

## Accessibility

- ARIA labels and roles
- Live regions for dynamic content
- Keyboard navigation support
- Screen reader friendly
- Semantic HTML
- Visual feedback for word limit

## Word Counter Feature

The textarea includes a smart word counter:
- Real-time word count display
- 256 word maximum
- Visual warning when approaching limit (230+ words)
- Prevents input beyond word limit
- Handles edge cases (empty input, multiple spaces)

## Troubleshooting

### Cannot Connect to WebSocket

- Ensure AI Server is running: `cd ../../ai-server && ./ai-server`
- Check that port 3002 is not blocked by firewall
- Verify WebSocket URL in browser console
- Check server logs for connection attempts

### Message Not Sending

- Ensure you have entered text in the textarea
- Check browser console for errors
- Verify WebSocket connection is open (status should be "Connected")
- Check AI Server logs

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

Bob client integrates with the AI Server architecture:

1. Connects to BobServer WebSocket (port 3002)
2. Sends user questions to Bob AI persona
3. Bob AI processes and forwards to Alice AI
4. Receives responses from the conversation
5. Displays text and plays audio

The Bob AI persona on the server:
- Receives initial questions from Bob client
- Processes questions (future LLM integration)
- Forwards to Alice AI
- Receives answers from Alice
- Sends responses back to Bob client

## Conversation Flow

```
User Input → Bob Client → BobServer → Bob AI
                                        ↓
                                   Alice AI
                                        ↓
                             Alice Client Display
                                        ↓
                                    Bob AI
                                        ↓
                            Bob Client Display
```

## Future Enhancements

- Voice input for question composition
- Conversation history display
- Question templates/suggestions
- Theme customization
- Multi-language support
- Enhanced audio controls (pause, seek, volume)
- Message editing before sending
- Conversation branching
- Save/export conversation history
