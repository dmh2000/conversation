const WS_URL = 'ws://localhost:8080';

const statusEl = document.getElementById('status')!;
const logEl = document.getElementById('log')!;

let messageCount = 0;
let sendInterval: number | null = null;

function log(message: string, type: 'sent' | 'received' | 'system') {
  const div = document.createElement('div');
  div.className = type;
  div.textContent = `[${new Date().toISOString()}] ${message}`;
  logEl.appendChild(div);
  logEl.scrollTop = logEl.scrollHeight;
}

function connect() {
  log(`Connecting to ${WS_URL}...`, 'system');
  statusEl.textContent = 'Status: Connecting...';

  const ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    log('Connected!', 'system');
    statusEl.textContent = 'Status: Connected';

    // Send message to server at 1 Hz
    sendInterval = window.setInterval(() => {
      messageCount++;
      const message = JSON.stringify({
        source: 'client',
        count: messageCount,
        timestamp: new Date().toISOString()
      });
      log(`Sent: ${message}`, 'sent');
      ws.send(message);
    }, 1000);
  };

  ws.onmessage = (event) => {
    log(`Received: ${event.data}`, 'received');
  };

  ws.onclose = () => {
    log('Disconnected', 'system');
    statusEl.textContent = 'Status: Disconnected';
    if (sendInterval) {
      clearInterval(sendInterval);
      sendInterval = null;
    }
    // Reconnect after 3 seconds
    log('Reconnecting in 3 seconds...', 'system');
    setTimeout(connect, 3000);
  };

  ws.onerror = (error) => {
    log(`Error: ${error}`, 'system');
    statusEl.textContent = 'Status: Error';
  };
}

// Start connection
connect();
