const WebSocket = require('ws');

let wss;

function setupWebSocketServer(server) {
    wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('New WebSocket client connected');

        ws.on('close', () => {
            console.log('WebSocket client disconnected');
        });

        ws.on('error', (err) => {
            console.error('WebSocket error:', err);
        });
    });
}

function broadcastToClients(data) {
    if (!wss) {
        console.error('WebSocket Server not initialized');
        return;
    }

    const message = JSON.stringify(data);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

module.exports = { setupWebSocketServer, broadcastToClients };
