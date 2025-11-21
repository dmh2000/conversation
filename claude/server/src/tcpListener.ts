import * as net from 'net';
import { Message } from './types';
import { broadcastMessage } from './websocketServer';

const TCP_PORT = process.env.TCP_PORT ? parseInt(process.env.TCP_PORT) : 8080;

export function initTcpListener(): void {
  const server = net.createServer((socket) => {
    console.log('TCP client connected');

    let buffer = '';

    socket.on('data', (data) => {
      buffer += data.toString();

      // Process all complete messages in the buffer
      let startIndex = 0;
      let braceCount = 0;
      let messageStart = -1;

      for (let i = 0; i < buffer.length; i++) {
        if (buffer[i] === '{') {
          if (braceCount === 0) {
            messageStart = i;
          }
          braceCount++;
        } else if (buffer[i] === '}') {
          braceCount--;

          if (braceCount === 0 && messageStart !== -1) {
            // We have a complete message
            const messageStr = buffer.substring(messageStart, i + 1);

            try {
              const message = JSON.parse(messageStr) as Message;

              // Validate message format
              if (typeof message.text === 'string' && typeof message.audio === 'string') {
                console.log('Received valid message from TCP:', message);
                broadcastMessage(message);
              } else {
                console.error('Invalid message format:', message);
              }
            } catch (error) {
              console.error('Failed to parse JSON message:', error);
            }

            // Remove processed message from buffer
            startIndex = i + 1;
          }
        }
      }

      // Keep only unprocessed data in buffer
      buffer = buffer.substring(startIndex);
    });

    socket.on('end', () => {
      console.log('TCP client disconnected');
    });

    socket.on('error', (error) => {
      console.error('TCP socket error:', error);
    });
  });

  server.listen(TCP_PORT, () => {
    console.log(`TCP listener started on port ${TCP_PORT}`);
  });

  server.on('error', (error) => {
    console.error('TCP server error:', error);
  });
}
