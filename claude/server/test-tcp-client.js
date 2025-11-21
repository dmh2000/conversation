const net = require('net');

const TCP_PORT = 8080;

function sendMessage(text, audio) {
  const client = net.createConnection({ port: TCP_PORT, host: 'localhost' }, () => {
    console.log('Connected to TCP server');

    const message = JSON.stringify({
      text: text,
      audio: audio
    });

    console.log('Sending message:', message);
    client.write(message);
    client.end();
  });

  client.on('error', (error) => {
    console.error('Connection error:', error.message);
  });

  client.on('close', () => {
    console.log('Connection closed');
  });
}

// Example usage
const args = process.argv.slice(2);

if (args.length >= 2) {
  const text = args[0];
  const audio = args[1];
  sendMessage(text, audio);
} else {
  console.log('Usage: node test-tcp-client.js "Your message text" "/audio/filename.mp3"');
  console.log('\nSending default test message...');
  sendMessage('Hello from TCP client!', '/audio/test.mp3');
}
