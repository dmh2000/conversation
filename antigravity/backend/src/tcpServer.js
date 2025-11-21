const net = require('net');

function startTcpServer(port, onMessageReceived) {
    const server = net.createServer((socket) => {
        console.log('TCP Client connected');

        let buffer = '';

        socket.on('data', (data) => {
            buffer += data.toString();

            // Process buffer for messages delimited by { and }
            // This is a simple parser assuming the message is a valid JSON object starting with { and ending with }
            // and that there are no nested braces for now, or we just look for the first { and the next }

            // A more robust approach for stream parsing:
            let startIndex = buffer.indexOf('{');
            while (startIndex !== -1) {
                let endIndex = buffer.indexOf('}', startIndex);

                if (endIndex !== -1) {
                    // Found a potential message
                    const rawMessage = buffer.substring(startIndex, endIndex + 1);

                    try {
                        const jsonMessage = JSON.parse(rawMessage);
                        // Validate structure
                        if (jsonMessage.text && jsonMessage.audio) {
                            onMessageReceived(jsonMessage);
                        } else {
                            console.warn('Received invalid message format:', jsonMessage);
                        }
                    } catch (e) {
                        console.error('Failed to parse JSON:', e.message, 'Raw:', rawMessage);
                    }

                    // Remove processed part from buffer
                    buffer = buffer.substring(endIndex + 1);

                    // Look for next message
                    startIndex = buffer.indexOf('{');
                } else {
                    // No closing brace yet, wait for more data
                    break;
                }
            }
        });

        socket.on('end', () => {
            console.log('TCP Client disconnected');
        });

        socket.on('error', (err) => {
            console.error('TCP Socket error:', err);
        });
    });

    server.listen(port, () => {
        console.log(`TCP Server listening on port ${port}`);
    });
}

module.exports = { startTcpServer };
