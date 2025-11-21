const express = require('express');
const http = require('http');
const { setupWebSocketServer, broadcastToClients } = require('./websocketServer');
const { startTcpServer } = require('./tcpServer');

const app = express();
const server = http.createServer(app);

const PORT = 3000; // WebSocket/HTTP port
const TCP_PORT = 3001; // TCP port

// Basic health check
app.get('/', (req, res) => {
    res.send('Antigravity Backend Running');
});

// Setup WebSocket Server
setupWebSocketServer(server);

// Start HTTP/WebSocket Server
server.listen(PORT, () => {
    console.log(`HTTP/WebSocket Server running on http://localhost:${PORT}`);
});

// Start TCP Server and pass the broadcast function
startTcpServer(TCP_PORT, (message) => {
    console.log('Broadcasting message to WebSocket clients:', message);
    broadcastToClients(message);
});
