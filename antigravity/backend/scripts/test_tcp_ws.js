const WebSocket = require('ws');
const net = require('net');

const WS_URL = 'ws://localhost:3000';
const TCP_PORT = 3001;

const TEST_MESSAGE = {
    text: 'Hello from TCP',
    audio: 'http://example.com/test.mp3'
};

function runTest() {
    console.log('Starting TCP -> WS Forwarding Test...');

    // 1. Connect WebSocket Client
    const ws = new WebSocket(WS_URL);

    ws.on('open', () => {
        console.log('WebSocket Client connected');

        // 2. Connect TCP Client
        const client = new net.Socket();
        client.connect(TCP_PORT, 'localhost', () => {
            console.log('TCP Client connected');

            // 3. Send JSON Message
            const payload = JSON.stringify(TEST_MESSAGE);
            // Wrap in braces if the server expects them as delimiters, 
            // but our server logic parses JSON objects. 
            // The server logic I wrote: `buffer.indexOf('{')` ... `buffer.indexOf('}', startIndex)`
            // So sending just the JSON string is fine as it contains { and }.

            console.log('Sending TCP message:', payload);
            client.write(payload);
        });

        client.on('close', () => {
            console.log('TCP Client closed');
        });
    });

    ws.on('message', (data) => {
        const received = JSON.parse(data);
        console.log('WebSocket received:', received);

        // 4. Verify
        if (received.text === TEST_MESSAGE.text && received.audio === TEST_MESSAGE.audio) {
            console.log('SUCCESS: Message forwarded correctly!');
            process.exit(0);
        } else {
            console.error('FAILURE: Received message does not match sent message.');
            process.exit(1);
        }
    });

    ws.on('error', (err) => {
        console.error('WebSocket error:', err);
        process.exit(1);
    });

    // Timeout
    setTimeout(() => {
        console.error('TIMEOUT: Test did not complete in time.');
        process.exit(1);
    }, 5000);
}

runTest();
