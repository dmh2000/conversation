import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import path from 'path';
import { initWebSocketServer } from './websocketServer';
import { initTcpListener } from './tcpListener';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const app = express();

// Enable CORS for all origins (adjust in production)
app.use(cors());

// Serve static files (for MP3 audio files)
app.use('/audio', express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Create HTTP server
const httpServer = createServer(app);

// Initialize WebSocket server
initWebSocketServer(httpServer);

// Initialize TCP listener
initTcpListener();

// Start HTTP server
httpServer.listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}`);
  console.log(`WebSocket server ready`);
  console.log(`Serving static files from /audio`);
});
