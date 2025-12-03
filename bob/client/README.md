# Bob Client

A cyberpunk-themed React application for interacting with the AI conversation system.

## Overview

Bob Client is a web-based interface that allows users to compose questions and send them to Alice through the AI Server. It features a modern cyberpunk/synthwave aesthetic with neon colors, animated backgrounds, and glowing text effects.

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

- **Cyberpunk UI Theme**: Dark purple backgrounds with neon cyan and magenta accents
- **Animated Grid Background**: 3D perspective grid with scrolling animation
- **Text Input**: Auto-expanding textarea with 256-word limit and counter
- **Real-time Connection**: WebSocket communication with AI Server
- **Message Display**: Animated message rendering with glowing effects
- **Responsive Design**: Mobile and desktop friendly
- **TypeScript**: Full type safety throughout the application

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

The application connects to the WebSocket server at `ws://localhost:3002`. This is configured in the `useWebSocket` hook.

## Components

### App.tsx

Main application component managing:
- Application state (started, input text, messages)
- WebSocket connection through custom hook
- Start screen and main screen rendering
- Word count validation
- Message handling

### MessageDisplay.tsx

Displays received messages with:
- Animated text entrance
- Glowing effects
- Empty state handling
- Accessibility support

### useWebSocket (websocketClient.ts)

Custom React hook providing:
- WebSocket connection management
- Auto-reconnection handling
- Message sending/receiving
- Connection status tracking

## User Flow

1. **Start Screen**: User enters a question (up to 256 words)
2. **Click "Go Ask Alice"**: Sends question to AI Server
3. **Main Screen**: Displays responses with cyberpunk styling
4. **Connection Status**: Shows real-time connection state with glowing indicator

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

- **React 19**: UI framework with latest features
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **CSS3**: Modern styling with animations
- **WebSocket API**: Real-time communication

## License

Part of the conversation project.
