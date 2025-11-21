import { WebSocketServer, WebSocket } from 'ws';
import { Server as HTTPServer } from 'http';
import { Message } from './types';

let wss: WebSocketServer;

export function initWebSocketServer(httpServer: HTTPServer): void {
  wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  console.log('WebSocket server initialized');
}

export function broadcastMessage(message: Message): void {
  if (!wss) {
    console.error('WebSocket server not initialized');
    return;
  }

  const messageStr = JSON.stringify(message);
  let sentCount = 0;

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
      sentCount++;
    }
  });

  console.log(`Broadcasted message to ${sentCount} client(s):`, message);
}
