import { WebSocketServer, WebSocket } from 'ws';

const PORT = 8080;

const wss = new WebSocketServer({ port: PORT });

console.log(`WebSocket server listening on ws://localhost:${PORT}`);

let messageCount = 0;

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');

  // Send message to client at 1 Hz
  const interval = setInterval(() => {
    messageCount++;
    const message = JSON.stringify({
      source: 'server',
      count: messageCount,
      timestamp: new Date().toISOString()
    });
    console.log(`Sending: ${message}`);
    ws.send(message);
  }, 1000);

  // Handle incoming messages from client
  ws.on('message', (data: Buffer) => {
    const message = data.toString();
    console.log(`Received: ${message}`);
  });

  // Handle client disconnect
  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(interval);
  });

  // Handle errors
  ws.on('error', (error: Error) => {
    console.error('WebSocket error:', error);
    clearInterval(interval);
  });
});

// Handle server errors
wss.on('error', (error: Error) => {
  console.error('Server error:', error);
});

console.log('Server ready. Waiting for connections...');
