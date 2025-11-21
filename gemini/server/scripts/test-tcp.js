const net = require('net');

const TCP_PORT = 3001;
const HOST = 'localhost';

const client = new net.Socket();

client.connect(TCP_PORT, HOST, () => {
    console.log('Connected to TCP server.');

    const message = {
        text: "Hello from TCP client!",
        audio: "http://localhost:3000/audio-1.mp3"
    };

    // Send the message as a JSON string
    client.write(JSON.stringify(message));
    console.log('Sent message:', message);

    // Close the connection after sending
    client.end();
    console.log('Connection closed.');
});

client.on('error', (err) => {
    console.error('TCP client error:', err);
});
