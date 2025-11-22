# Gemini Real-Time Messaging App

This project is a real-time messaging web application with a React frontend and a Node.js backend. The backend listens for messages via a raw TCP socket and forwards them to the frontend clients using WebSockets.

## Project Structure

- `client/`: Contains the Vite + React + TypeScript frontend application.
- `server/`: Contains the Node.js + Express + WebSocket + TCP backend application.

## How to Run

You will need two separate terminal sessions to run both the frontend and backend servers.

### 1. Run the Backend Server

1.  Navigate to the `server` directory:
    ```bash
    cd gemini/server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    The backend server will be running on `http://localhost:3000` (for WebSockets) and `localhost:3001` (for TCP).

### 2. Run the Frontend Client

1.  In a new terminal, navigate to the `client` directory:
    ```bash
    cd gemini/client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    The frontend application will be available at `http://localhost:5173`.

### 3. Test the Application

1.  Open your web browser and go to `http://localhost:5173`. You should see the message "Waiting for message...".
2.  In a third terminal, run the TCP test script to send a message to the backend:
    ```bash
    cd gemini/server
    node scripts/test-tcp.js
    ```
3.  Observe the web browser. The message should update to "Hello from TCP client!", and you should hear an audio clip play.
