# Bob Client

A cyberpunk-themed React application for interacting with the AI conversation system.

## Overview

Bob Client is a web-based interface that allows users to compose questions and send them to Alice through the AI Server. It features a modern cyberpunk/synthwave aesthetic with neon cyan and magenta colors, animated grid backgrounds, and glowing text effects. The client connects via WebSocket to the AI Server's BobServer endpoint (port 3002) and displays text responses with smooth animations.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Features

- **Cyberpunk UI Theme**: Dark purple gradient backgrounds with neon cyan and magenta accents
- **Animated Grid Background**: 3D perspective grid with scrolling animation effect
- **Smart Text Input**: Auto-expanding textarea with 256-word limit, real-time word counter, and visual warnings
- **Real-time WebSocket**: Persistent connection to AI Server with auto-reconnection
- **Message Display**: Animated text rendering with fade-in effects and glowing text
- **Connection Status**: Visual indicator with pulsing glow effects
- **Start Screen**: Initial composition screen with "Go Ask Alice" button
- **Responsive Design**: Optimized for both mobile and desktop viewports
- **TypeScript**: Full type safety and enhanced IDE support
- **Accessibility**: ARIA labels, semantic HTML, keyboard navigation

## Theme Details

### Color Palette

- **Background**: Dark purple gradient (#0a0a1e to #16001e)
- **Primary**: Neon cyan (#00fff0)
- **Secondary**: Neon magenta (#ff006e)
- **Accent**: Neon blue (#4d4dff)
- **Text**: White with glowing effects

### Typography

- **Display Font**: Orbitron (headings, buttons, UI elements)
- **Body Font**: Rajdhani (content, messages, text areas)

### Animations

- Grid scrolling background
- Fade-in entrance animations
- Pulsing connection indicators
- Glowing text effects
- Smooth transitions on all interactive elements

## Project Structure

```
src/
├── App.tsx                    # Main application component
├── App.css                    # Component styles
├── index.css                  # Global styles and theme variables
├── main.tsx                   # Application entry point
├── components/
│   └── MessageDisplay.tsx     # Message display component
└── services/
    └── websocketClient.ts     # WebSocket connection hook
```

## Development

### Prerequisites

- Node.js 18+
- npm or yarn
- AI Server running on port 3002

### Scripts

- `npm run dev` - Start development server (http://localhost:5174)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment

**WebSocket Connection**: The application connects to `ws://localhost:3002` (BobServer endpoint on the AI Server). This is configured in `src/services/websocketClient.ts` line 7.

**Development Server**: The client runs on `http://localhost:5174` by default (Vite dev server).

## Components

### App.tsx

Main application component (`src/App.tsx:1`)

**State Management:**
- `isStarted`: Tracks whether user has submitted initial question
- `inputText`: Current textarea content with 256-word limit
- `currentMessage`: Latest message received from server

**Responsibilities:**
- Renders start screen with input form and "Go Ask Alice" button
- Renders main screen with connection status and message display
- Manages WebSocket connection via `useWebSocket` hook
- Validates word count and provides visual feedback
- Handles textarea auto-expansion

### MessageDisplay.tsx

Message display component (`src/components/MessageDisplay.tsx:1`)

**Features:**
- Animated fade-in effect when new message arrives
- Empty state with "AWAITING TRANSMISSION..." placeholder
- Glowing text effects with cyberpunk styling
- ARIA live regions for screen reader support

### useWebSocket Hook

WebSocket connection hook (`src/services/websocketClient.ts:9`)

**Capabilities:**
- Establishes WebSocket connection to `ws://localhost:3002`
- Auto-reconnection with 3-second delay on disconnect
- Message parsing (JSON format)
- Connection status tracking
- `send()` function for transmitting messages
- Cleanup on component unmount

**Message Interface:**
```typescript
interface Message {
  text: string;
}
```

## User Flow

1. **Initial Load**:
   - Application displays start screen with Bob title
   - Animated cyberpunk grid background
   - Empty textarea ready for input

2. **Compose Question**:
   - User types in auto-expanding textarea
   - Word counter updates in real-time (shows current/256 words)
   - Counter turns magenta when approaching limit (230+ words)
   - Input prevented beyond 256 words

3. **Submit Question**:
   - "Go Ask Alice" button enabled when text entered
   - Click sends message to AI Server via WebSocket
   - Transitions to main screen

4. **Main Screen**:
   - Header with Bob title and connection status indicator
   - Status shows "Connected" (green glow) or "Disconnected" (red glow)
   - Message display area shows "AWAITING TRANSMISSION..." until response arrives

5. **Receive Response**:
   - Response text appears with animated fade-in effect
   - Text has glowing neon cyan effect
   - WebSocket maintains connection for future messages
   - Auto-reconnects if connection lost

## Styling Architecture

The application uses CSS custom properties (CSS variables) defined in `index.css`:

- **Colors**: Neon cyberpunk palette
- **Typography**: Font sizes with responsive scaling
- **Spacing**: Consistent spacing scale
- **Animations**: Timing and easing functions
- **Effects**: Glow and shadow effects

All component styles in `App.css` reference these variables for consistent theming.

## Accessibility

- ARIA labels on all interactive elements
- Live regions for dynamic content updates
- Semantic HTML structure
- Keyboard navigation support
- High contrast neon colors for visibility
- Screen reader friendly status indicators

## Browser Support

Modern browsers with support for:
- CSS Grid and Flexbox
- CSS Custom Properties
- WebSocket API
- ES6+ JavaScript

## Troubleshooting

### WebSocket Connection Issues

- Ensure AI Server is running on port 3002
- Check browser console for connection errors
- Verify firewall settings

### Styling Not Loading

- Hard refresh the browser (Ctrl+Shift+R)
- Check Network tab for font loading
- Verify CSS custom properties support

### Build Errors

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Ensure TypeScript and ESLint configs are valid

## Technologies

- **React 19.2.0**: Latest UI framework with modern hooks and concurrent features
- **TypeScript 5.9.3**: Static typing and enhanced IDE support
- **Vite 7.2.6**: Next-generation frontend build tool with HMR
- **CSS3**: Modern styling with custom properties, grid, flexbox, and keyframe animations
- **WebSocket API**: Native browser WebSocket for real-time bidirectional communication
- **ESLint**: Code quality and consistency enforcement

## Dependencies

**Runtime Dependencies:**
```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0"
}
```

**Key Dev Dependencies:**
- `@vitejs/plugin-react`: Vite plugin for React Fast Refresh
- `typescript`: Type checking and compilation
- `eslint`: Linting with React hooks plugin
- `@types/react` & `@types/react-dom`: TypeScript type definitions

**Note**: This is a lightweight client with minimal dependencies. No audio libraries, state management libraries, or UI frameworks are used.

## Architecture Overview

Bob Client is one part of a larger AI conversation system:

```
┌─────────────────┐
│   Bob Client    │ (This app - Port 5174)
│   React + WS    │
└────────┬────────┘
         │ WebSocket (ws://localhost:3002)
         ▼
┌─────────────────┐
│   AI Server     │ (Go server in ../ai-server/)
│                 │
│  ┌───────────┐  │
│  │ BobServer │  │ Port 3002 (WebSocket)
│  └─────┬─────┘  │
│        │        │
│  ┌─────▼─────┐  │
│  │  Bob AI   │  │ (Question processor)
│  └─────┬─────┘  │
│        │        │
│  ┌─────▼─────┐  │
│  │ Alice AI  │  │ (Answer generator)
│  └─────┬─────┘  │
│        │        │
│  ┌─────▼─────┐  │
│  │AliceServer│  │ Port 3001 (WebSocket)
│  └───────────┘  │
└─────────┬───────┘
          │ WebSocket (ws://localhost:3001)
          ▼
┌─────────────────┐
│  Alice Client   │ (Separate app - Port 5173)
│   React + WS    │
└─────────────────┘
```

**How it works:**
1. User enters question in Bob Client
2. Bob Client sends to BobServer via WebSocket
3. Bob AI processes question
4. Alice AI generates answer
5. Response returns to Bob Client via BobServer
6. Alice Client shows the conversation from Alice's perspective

**Key Files:**
- This client: `bob/client/` (React app)
- AI Server: `ai-server/` (Go server with BobServer, AliceServer, Bob AI, Alice AI)
- Alice Client: `alice/client/` (React app showing Alice's view)

## License

Part of the conversation project.
