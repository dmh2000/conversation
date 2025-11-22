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

place the app and all its components in the 'gemini' directory

here's an example of the data flow using mermaid syntax

```mermaid
  TCP_CLIENT-->WEBSOCKET_SERVER
  WEBSOCKET_SERVER-->WEB_APP
  WEB_APP-->Display Text
  WEB_APP-->Play mp3 file
```

Using the information in this file, generate a detailed plan for building the app and all its components. 
If you find any errors or inconsistencies in this description, stop and tell me the problem. Only create the plan when this description has no problems.

Do not create the app yet. but when you do, place the app and its components in directory 'gemini'. 

--------------------------------------------------------------------
# browser security rules prevent playing an audio file if the user has not interacted with the web app at least one.
## modify the gemini web app as follows:
- make the changes to the app in directory 'gemini'
- when the home page is first displayed, show only a button labeled 'Start'
- when the Start button is clicked, show the original page with the text and audio player
## also modify prompts/gemini-plan.md so it reflects this change in the app behavior

--------------------------------------------------------------------
@gemini/server/src/index.ts modify gemini server so that its express server will serve  
  any files stored in gemini/server/public 

-----------------------------------------------------------------------------
@bob when bob/client1 starts, it displays a button named "Start". Make the following changes:
- show a header that says "Bob". locate it in the center of the window
- place a text entry area in the center of the window. the user can type in the text area with a limit of 256 words. the text area should use 80% of the window and should expand if more room is needed to enter the text.
- replace the "Start" button with a "Go Ask Alice" button. disable the button until the user has entered text in the text area
- when the "Go Ask Alice" button clicked, send the contents of the text area to the websocket server. then transition the display to the existing page that shows text and audio.

-------------------------------------------------------------------
@bob/client change the text 'Real-time Message Display' to "Bob"
- show the controls for the audio playback when there is one
-------------------------------------------------------------------
@bob/client make the player controls the same width as the text area