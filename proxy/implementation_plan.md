# Proxy Server Implementation Plan

## Objective
Create a Python web server acting as a reverse proxy for Alice (port 8001) and Bob (port 8002) applications. The proxy will listen on port 8000.

## Specifications
- **Port**: 8000
- **Language**: Python
- **Location**: `proxy/` directory
- **Features**:
  - Main page (`/`) with links to Alice and Bob.
  - Reverse proxy functionality to forward traffic to Alice and Bob servers.

## Architecture
- **Framework**: Flask (lightweight, easy to implement proxy logic).
- **Dependencies**: `flask`, `requests`.

## Implementation Steps

### 1. Setup Environment
- Create `proxy/requirements.txt` with:
  - `flask`
  - `requests`

### 2. Develop Proxy Server (`proxy/server.py`)
- Initialize Flask application.
- **Root Route (`/`)**:
  - Serve a simple HTML page containing:
    - Title: "Proxy"
    - Link to `/alice/`
    - Link to `/bob/`
- **Proxy Routes**:
  - Define a catch-all route for `/alice` and subpaths.
    - Forward method, headers, and body to `http://localhost:8001`.
    - Return response from Alice to the client.
  - Define a catch-all route for `/bob` and subpaths.
    - Forward method, headers, and body to `http://localhost:8002`.
    - Return response from Bob to the client.

### 3. Execution
- Run the server using `python proxy/server.py`.

## Verification
1. Start Alice server on 8001 (mock or actual).
2. Start Bob server on 8002 (mock or actual).
3. Start Proxy on 8000.
4. Access `http://localhost:8000` and verify links.
5. Click links and verify content is served from respective backends.
