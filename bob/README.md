# Bob Client

Bob is a React-based web application that allows users to send questions to Alice through the AI Server. It features a cyberpunk-themed interface for composing questions and displays text responses from the conversation with a sleek, neon-styled UI.

## Architecture

```
User Input → Bob Client (React) → WebSocket (Port 8004) → AI Server
                                                              ↓
                                                          Bob AI Persona
                                                              ↓
                                                          Alice AI Persona
                                                              ↓
                                           Response → Bob Client (Display)
```

**Key Components:**
- **Bob Client**: React web application (this directory)
- **AI Server**: Go-based WebSocket server managing communication between Bob and Alice personas
- **Port 8004**: Bob client connects to BobServer WebSocket endpoint

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
bob/
├── client/                        # React web application
│   ├── src/
│   │   ├── App.tsx                # Main application component
│   │   ├── components/
│   │   │   └── MessageDisplay.tsx # Message display with animations
│   │   ├── services/
│   │   │   └── websocketClient.ts # WebSocket connection hook
│   │   ├── App.css                # Component and cyberpunk theme styles
│   │   ├── index.css              # Global styles and CSS variables
│   │   └── main.tsx               # Application entry point
│   ├── public/                    # Static assets
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
└── README.md                      # This file
```

**Note**: Bob does not have a local server. It connects to the shared AI Server located in the `ai-server/` directory at the project root.

## Setup and Installation

### Prerequisites

- Node.js 18+ and npm
- AI Server running on port 8004

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
const ws = new WebSocket('ws://localhost:8004');
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
   - Responses from the conversation appear in the main display area
   - Messages are shown with animated fade-in effects and neon styling

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

- **React 19** - UI framework with modern hooks
- **TypeScript** - Type safety and enhanced development experience
- **Vite** - Fast build tool and development server
- **WebSocket API** - Real-time bidirectional communication
- **Orbitron & Rajdhani** - Google Fonts for cyberpunk typography
- **CSS3** - Modern animations, grid, flexbox, and custom properties

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
- Check that port 8004 is not blocked by firewall
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

Bob client integrates with the Go-based AI Server architecture:

1. **Connection**: Connects to BobServer WebSocket endpoint (port 8004)
2. **Send Question**: User submits question from Bob client
3. **Server Processing**:
   - BobServer receives question
   - Bob AI persona processes the question
   - Bob AI forwards to Alice AI persona via Go channels
   - Alice AI generates response
   - Response flows back through Bob AI
4. **Display Response**: Bob client receives and displays the response with animated effects

**AI Server Components** (located in `ai-server/` directory):
- **BobServer**: WebSocket server on port 8004 for Bob clients
- **Bob AI**: Persona that handles question processing and conversation management
- **Alice AI**: Persona that generates answers
- **AliceServer**: WebSocket server on port 8003 for Alice clients (displays the conversation from Alice's perspective)

**Message Flow**: Bob Client → BobServer → Bob AI → Alice AI → Bob AI → BobServer → Bob Client

## Conversation Flow

```
┌─────────────┐
│ User Input  │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Bob Client     │ (Port 5174, this app)
│  (React UI)     │
└────────┬────────┘
         │ WebSocket
         ▼
┌─────────────────┐
│  BobServer      │ (Port 8004, in ai-server/)
└────────┬────────┘
         │ Go Channel
         ▼
┌─────────────────┐
│  Bob AI Persona │ (in ai-server/)
└────────┬────────┘
         │ Go Channel
         ▼
┌─────────────────┐
│ Alice AI Persona│ (in ai-server/)
└────────┬────────┘
         │ Go Channel (response)
         ▼
┌─────────────────┐
│ BobServer       │ (sends response to Bob Client)
└────────┬────────┘
         │ WebSocket
         ▼
┌─────────────────┐
│ Bob Client      │ (displays response)
│ MessageDisplay  │
└─────────────────┘
```

## Future Enhancements

- **LLM Integration**: Full integration with language models (in progress on server)
- **Conversation History**: Display scrollable timeline of past exchanges
- **Question Templates**: Pre-defined question formats and suggestions
- **Message Editing**: Edit questions before sending
- **Export Conversations**: Save/export conversation history as JSON or text
- **Voice Input**: Speech-to-text for question composition
- **Accessibility Controls**: Animation intensity and contrast adjustments
- **Customization**: User-selectable color schemes within cyberpunk theme
- **Sound Effects**: Audio feedback for message sending/receiving
- **Multi-language**: Support for questions and responses in multiple languages
