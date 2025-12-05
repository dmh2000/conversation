the ai-server needs a way to be restarted in order to start a new session. how can we do this? here are some thoughts:
- each of the web UI's, Alice and Bob, have a 'restart' button. when clicked, they should send a message to the ai-server to restart the session, and reload the web page
- the ai-server should listen on the websocket for this message and reset its state.
