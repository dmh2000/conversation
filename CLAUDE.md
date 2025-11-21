# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This repository is a comparison project for evaluating different AI coding assistants. It contains identical prompts for building the same web application, with separate directories for implementations by different AI assistants.

## Project Structure

```
conversation/
├── claude/          # Implementation by Claude AI
├── gemini/          # Implementation by Gemini AI
├── prompts/         # Prompt specifications and plans
│   ├── claude-app.md
│   ├── claude-plan.md
│   └── gemini-app.md
```

## Application Specification

The prompts define a real-time messaging web application with the following architecture:

**Data Flow:** TCP Client → WebSocket Server → React Web App → Display + Audio Playback

**Components:**
- **Frontend:** Vite + React + TypeScript web application
- **Backend:** Node.js + Express server with integrated WebSocket server
- **TCP Listener:** Listens on a separate port for JSON messages
- **Message Format:**
  ```json
  {
    "text": "string",  // Text to display on web page
    "audio": "string"  // Path to MP3 audio file
  }
  ```

**Server Behavior:**
- WebSocket server receives JSON messages from TCP port
- Messages use opening/closing braces as delimiters
- Server forwards messages to connected web clients via WebSocket

**Client Behavior:**
- Connects to WebSocket server
- On message receipt: displays text and plays specified MP3 file

## Implementation Plan

A detailed implementation plan for the Claude version has been created at `prompts/claude-plan.md`. This plan includes:

- Complete project structure for both server and client
- 13 implementation steps organized into 3 phases:
  1. **Phase 1: Server Setup** - Express server, WebSocket server, TCP listener
  2. **Phase 2: Client Setup** - Vite/React/TypeScript frontend with WebSocket client
  3. **Phase 3: Integration & Testing** - Development scripts and testing strategy
- Technical considerations for TCP message parsing, WebSocket communication, and audio playback

Refer to `prompts/claude-plan.md` for the complete implementation guide.

## Working with This Repository

When implementing or modifying the application in either the `claude/` or `gemini/` directory:

1. Each implementation should be self-contained within its directory
2. Refer to the corresponding prompt file in `prompts/` for specification details
3. For Claude implementation: Follow the detailed plan in `prompts/claude-plan.md`
4. The Claude implementation goes in `claude/`, Gemini implementation in `gemini/`
5. Implementations should match the exact specifications in the prompt files
