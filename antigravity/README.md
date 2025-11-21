# Antigravity Web App

A real-time messaging application that displays text and plays audio triggered by TCP messages.

## Components

- **Backend**: Node.js + Express + WebSocket + TCP Server
- **Frontend**: Vite + React + TypeScript

## Setup

1.  **Backend**:
    ```bash
    cd backend
    npm install
    npm start
    ```
    Runs on `http://localhost:3000` (WS) and port `3001` (TCP).

2.  **Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    Runs on `http://localhost:5173` (default).

## Usage

1.  Start both backend and frontend.
2.  Open the frontend in a browser.
3.  Send a JSON message to the TCP port (3001):
    ```bash
    echo '{"text": "Hello World", "audio": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"}' | nc localhost 3001
    ```
4.  The web page should display "Hello World" and play the audio.
