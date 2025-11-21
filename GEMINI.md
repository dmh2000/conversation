# GEMINI.md

This file provides context and guidance for Gemini agents working in this repository.

## Project Overview

This repository serves as a comparison sandbox for evaluating different AI coding assistants. It contains specifications for building a real-time messaging web application, with designated directories for implementations by different AIs.

## Workspace & Boundaries

*   **Your Workspace:** `gemini/`
    *   All code, configuration, and assets you generate must be placed inside this directory.
    *   Treat this directory as the root of your specific project.
*   **Restricted Areas:**
    *   `claude/`: Do not modify or access files in this directory. It belongs to another agent.
    *   `prompts/`: Read-only. Contains the specifications.

## Application Specification

Refer to `prompts/gemini-app.md` for the primary instructions.

**Summary of Architecture:**
*   **Data Flow:** TCP Client → WebSocket Server → React Web App → UI Display + Audio Playback
*   **Frontend:** Vite + React + TypeScript
*   **Backend:** Node.js + Express (HTTP) + WebSocket Server (WS) + TCP Listener (Net)
*   **Message Protocol:**
    *   JSON format: `{"text": "...", "audio": "..."}`
    *   Delimiters: Opening `{` and closing `}` braces for TCP streams.

## Development Workflow

1.  **Read Specs:** Always start by reviewing `prompts/gemini-app.md` to understand the requirements.
2.  **Plan:** Create a step-by-step plan before writing code, as requested in the prompt.
3.  **Implement:** Generate the application code within the `gemini/` folder.
4.  **Verify:** Ensure the TCP listener correctly forwards messages to the WebSocket clients and that the frontend handles the JSON payload as expected (displaying text and playing audio).

## Key Commands (Inferred)

Since the project is currently in a setup phase, you will likely need to initialize the project structure yourself.

*   **Scaffold:** `npm create vite@latest .` (inside `gemini/frontend` or similar)
*   **Backend Init:** `npm init -y` (inside `gemini/backend`)
*   **Run:** You will need to define scripts (e.g., `npm run dev`, `npm start`) in the respective `package.json` files you create.
