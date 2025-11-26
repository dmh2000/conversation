# AI Server



@prompts/ai-server.jpg 
# implement a server in the Go programming language
The server will have 4 main components:
- BobServer: WebSocket server listenting on port 3002 for connections from the Bob web app
- BobAI: a goroutine that will use an AI LLM to simulate a person named bob who asks questions
- AliceServer: WebSocket server listening on port 3001 for connections from the Alice web app
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

- the Alice web app WebSocket client will connect to localhost port 3001
- the AliceServer will listen for a WebSocket connection on localhost port 3001
- only one WebSocket connection will be allowed at a time
- if a WebSocket client closes its connection, the WebSocket server will listen for a new connection
- when the AliceServer receives a message on the WebSocket, it will forward the the message 'text' data to the AliceAI channel. The AliceAI will response with a dummy message "Hello from Alice AI"
 
- the Bob web app WebSocket client will connect to localhost port 3002 
- The BobServer will listen for a WebSocket connection on localhost port 3002- only one WebSocket connection will be allowed at a time
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


