create a web app as follows:

- create the app using vite, react and typescript
- the server will use node and express
- the server will include a separate websocket server
- the web app will connect to the websocket server
- the web app listens for messages from the websocket server
- the messages will be in JSON with this format
```
{
    "text" : "string" // text to be displayed on the web page,
    "audio": "string" // path to an mp3 audio file
}
```
- when the web app receives a message of that format it will:
  - display the text
  - load and play the specified mp3 file

- the web socket server will listen on a separate TCP port for a JSON message as described, and when it receives a message it will then forward the message to the web app on the web socket server. 
- use the opening and closing braces to delimit the message when receving it on the TCP port.

place the app and all its components in the 'alice' directory

here's an example of the data flow using mermaid syntax

```mermaid
  TCP_CLIENT-->WEBSOCKET_SERVER
  WEBSOCKET_SERVER-->WEB_APP
  WEB_APP-->Display Text
  WEB_APP-->Play mp3 file
```

Using the information in this file, generate a detailed plan for building the app and all its components. 
If you find any errors or inconsistencies in this description, stop and tell me the problem. Only create the plan when this description has no problems.

do not create the app yet. but when you do, place the app and its components in directory 'alice'. 

-----------------------------------------------------------------------------
when i run the client I get a blank screen and an error message "Uncaught SyntaxError: The requested module '/src/services/websocketClient.ts' does not provide an export named 'Message' (at App.tsx:2:24)"

-----------------------------------------------------------------------------
alice/client/App.tsx has this error in the editor : Message' is a type and must be
 imported using a type-only import when 'verbatimModuleSyntax' is enabled.ts(1484)

 ----------------------------------------------------------------------------
 @alice/client modify the main client web page as follows:
 - change the title from "WebSocket Messaging App" to "Alice"
 - center everything
 - make the "Message:" box and the "Audio:" text areas use 80% of the full window width
 -----------------------------------------------------------------------------
 @alice/client when the client receives a message, it should play the audio automatically
 ------------------------------------------------------------------------------------
 @alice/client the browser does not allow the mp3 to autoplay until the user interacts with the app.
 - in the main page, when it is first displayed:
   - show the title "Alice"
   - show a button named "Start" 
     - when the Start button is clicked, change the page to the original page with the title, text and audio file. 
     - this will enable the browser to play the audio