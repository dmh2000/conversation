Create a plan for implementing awebserver that acts as a reverse proxy for the Alice/client and Bob/client applications.
- Listen on port 8000
- have a main page that just says "proxy" and has links to Alice/client and Bob/client
- Forward requests to the web servers running Alice/client and Bob/client
- Alice/client will listen on port 8001
- Bob/client will listen on port 8002
- implement the proxy using Python
- place the code for the proxy in directory "proxy"

create a simple python web server that will be used to serve either alice/client or bob/client. it should have a command line argument setting the port to listen on and the directory to serve files from. place the code in directory "alice/server" and "bob/server"