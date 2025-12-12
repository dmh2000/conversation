# AI Server



@prompts/ai-server.jpg 
# implement a server in the Go programming language
The server will have 4 main components:
- BobServer: WebSocket server listenting on port 8004 for connections from the Bob web app
- BobAI: a goroutine that will use an AI LLM to simulate a person named bob who asks questions
- AliceServer: WebSocket server listening on port 8003 for connections from the Alice web app
- AliceAI : a goroutine that will use an AI LLM to simulate a person named Alice who answers questions

There will be 3 Go channels:
  - BobServer <-> BobAI
  - AliceServer <-> AliceAI
  - BobAI -> ALiceAI

# Message Types
- Messages between the Web socket clients and the Web socket servers is JSON
```
Type ConversationMessage

{
    text: string
    audio: string
}
```
- a message from a WebSocket server will have both fields populated
- a message from a WebSocket client will have the text field populated with an empty string for the audio member

- Messages on go channels will be simple strings

# BobServer and AliceServer functionality
For now, this will be scaffolding out the process structure and will be built up later

- the Alice web app WebSocket client will connect to localhost port 8003
- the AliceServer will listen for a WebSocket connection on localhost port 8003
- only one WebSocket connection will be allowed at a time
- if a WebSocket client closes its connection, the WebSocket server will listen for a new connection
- when the AliceServer receives a message on the WebSocket, it will forward the the message 'text' data to the AliceAI channel. The AliceAI will response with a dummy message "Hello from Alice AI"
 
- the Bob web app WebSocket client will connect to localhost port 8004 
- The BobServer will listen for a WebSocket connection on localhost port 8004- only one WebSocket connection will be allowed at a time
- if a WebSocket client closes its connection, the WebSocket server will listen for a new connection
- when the BobServer receives a message on the WebSocket, it will forward the message 'text' data to the BobAI channel. The BobAI will response with a dummy message "Hello from BobAI AI"


# AIServer Setup
- All code will be in the 'ai-server' directory
- execute the following:
  - cd ai-server
  - bash: go mod init github.com/dmh2000/ai-server 
  - bash: mkdir 'cmd'
  - create a 'cmd/main.go' file
  - proceed to scaffold out the project structure
  - use separate file or files each for the four components
  - name the component files properly




--------------------------------------------------------------------------------------------------
  You can now test the implementation by:

  1. Open Alice client at http://localhost:5173/
  2. Open Bob client at http://localhost:5174/
  3. Click "Go Ask Alice" in the Bob client to send a message
  4. Both clients should connect to the AI server and exchange messages

  The AI server will log all connections and message exchanges. Check the server
  output to see the communication flow.

  📝 Current Behavior

  - Bob client sends a message → BobAI responds with "Hello from Bob AI. Processing
  your input: [message]"
  - BobAI forwards question to AliceAI
  - AliceAI responds with "Hello from Alice AI. You said: [question]"
  - Response is displayed in Alice client

  🔮 Next Steps (Future Enhancements)

  The scaffolding is complete. Future work includes:
  - LLM integration (replace dummy responses with actual AI)
  - Audio generation (text-to-speech)
  - Conversation context management
  - Static file serving for audio files

  All background processes are running and ready for testing!
