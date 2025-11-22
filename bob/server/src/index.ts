import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import net from 'net';
import path from 'path';

const app = express();
app.use(express.static(path.join(__dirname, '../public')));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const HTTP_PORT = 3000;
const TCP_PORT = 3001;

// WebSocket server logic
wss.on('connection', ws => {
  console.log('WebSocket client connected');
  ws.on('message', message => {
    try {
      const receivedMessage = JSON.parse(message.toString());
      if (receivedMessage.text) {
        console.log('Received from WebSocket client:', receivedMessage.text);
        // Optionally, broadcast this message to other clients or process it further
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  });
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// Function to broadcast to all WebSocket clients
const broadcast = (data: object) => {
  const jsonData = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(jsonData);
    }
  });
};

// TCP server logic
const tcpServer = net.createServer(socket => {
  console.log('TCP client connected');
  let buffer = '';

  socket.on('data', data => {
    buffer += data.toString();
    
    let startIdx;
    let endIdx;
    
    while ((startIdx = buffer.indexOf('{')) !== -1 && (endIdx = buffer.indexOf('}')) !== -1) {
      if (startIdx < endIdx) {
        const messageStr = buffer.substring(startIdx, endIdx + 1);
        try {
          const message = JSON.parse(messageStr);
          console.log('Received from TCP:', message);
          broadcast(message);
        } catch (error) {
          console.error('Failed to parse JSON from TCP stream:', error);
        }
        buffer = buffer.substring(endIdx + 1);
      } else {
         // Malformed buffer, } comes before {
         buffer = buffer.substring(startIdx);
      }
    }
  });

  socket.on('end', () => {
    console.log('TCP client disconnected');
  });

  socket.on('error', err => {
    console.error('TCP socket error:', err);
  });
});

// Start servers
server.listen(HTTP_PORT, () => {
  console.log(`HTTP and WebSocket server listening on port ${HTTP_PORT}`);
});

tcpServer.listen(TCP_PORT, () => {
  console.log(`TCP server listening on port ${TCP_PORT}`);
});
