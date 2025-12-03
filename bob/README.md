# Bob Client

Bob is a React-based web application that allows users to send questions to Alice through the AI Server. It features a cyberpunk-themed input interface for composing questions and displays responses from the conversation with a sleek, neon-styled UI.

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
- ✅ Connection status indicator with neon glow effects
- ✅ Start screen with "Go Ask Alice" button
- ✅ Cyberpunk/Synthwave themed UI with animated grid background
- ✅ Neon cyan and magenta color scheme
- ✅ TypeScript for type safety
- ✅ Responsive design
- ✅ Smooth animations and glowing text effects

## Project Structure

```
bob/client/
├── src/
│   ├── App.tsx                    # Main application component
│   ├── components/
│   │   └── MessageDisplay.tsx     # Message display with animations
│   ├── services/
│   │   └── websocketClient.ts     # WebSocket connection management
│   ├── App.css                    # Cyberpunk theme styling
│   ├── index.css                  # Global styles and CSS variables
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
  "text": "Response text from conversation"
}
```

- `text`: The response text to display

## Components

### App.tsx

Main application component that handles:
- WebSocket connection management
- Message sending and receiving
- Connection state tracking
- Input handling with word count
- Start screen display
- Status indicator with cyberpunk styling

### MessageDisplay.tsx

Message display component featuring:
- Text animation on message arrival
- Animated entrance effects
- Glowing text with pulse effects
- Empty state with "AWAITING TRANSMISSION..." message
- Accessibility support with ARIA labels

## User Interface

### Start Screen

- Cyberpunk-themed centered layout with animated grid background
- Large "Bob" title with neon cyan glow
- Auto-expanding textarea with glowing border effects
- Word counter with neon magenta warning when near limit
- "Go Ask Alice" button with hover animation
- Button disabled until text is entered
- Dark purple gradient background with subtle animations

### Main Screen

- Fixed header with "Bob" title and neon cyan glow
- Connection status indicator with pulsing glow effects
- Message display area with glowing text animations
- Centered message layout with fade-in effects
- Empty state shows "AWAITING TRANSMISSION..." with blinking animation
- Animated cyberpunk grid background
- Neon color scheme (cyan, magenta, blue)

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
- **WebSocket API** - Real-time communication
- **Orbitron & Rajdhani** - Google Fonts for cyberpunk typography

## Styling

The application uses modern CSS with a cyberpunk/synthwave theme:
- CSS Grid and Flexbox layouts
- CSS custom properties (CSS variables) for theming
- Smooth animations and transitions (fadeIn, slideDown, pulse, glow)
- Animated 3D-perspective grid background
- Dark purple gradient backgrounds with radial overlays
- Neon cyan, magenta, and blue color palette
- Glowing effects using text-shadow and box-shadow
- Responsive design for mobile and desktop
- High contrast neon colors for accessibility
- Animated text glows and pulsing connection indicators

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

### Blank Screen

- Check browser console for errors
- Verify all dependencies are installed: `npm install`
- Try clearing the Vite cache: `rm -rf node_modules/.vite`

### Styling Issues

- Ensure Google Fonts are loading (check Network tab)
- Verify CSS custom properties are supported in your browser
- Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for CSS errors

## Integration with AI Server

Bob client integrates with the AI Server architecture:

1. Connects to BobServer WebSocket (port 3002)
2. Sends user questions to Bob AI persona
3. Bob AI processes and forwards to Alice AI
4. Receives responses from the conversation
5. Displays text with animated effects

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
- Conversation history display with scrollable timeline
- Question templates/suggestions
- Alternative theme options (keep cyberpunk, add others)
- Multi-language support
- Message editing before sending
- Conversation branching and threading
- Save/export conversation history
- Customizable color schemes within cyberpunk theme
- Sound effects for message sending/receiving
- Dark/light mode toggle (maintaining cyberpunk aesthetic)
- Animation intensity controls for accessibility
