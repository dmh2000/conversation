import argparse
import http.server
import socketserver
import os
import sys

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        return super(CORSRequestHandler, self).end_headers()

def run_server(port, directory):
    # Normalize directory path
    directory = os.path.abspath(directory)
    
    if not os.path.isdir(directory):
        print(f"Error: Directory '{directory}' does not exist.")
        sys.exit(1)
    
    # Change to the directory to serve so SimpleHTTPRequestHandler works relative to it
    os.chdir(directory)
    
    # Allow address reuse to avoid "Address already in use" errors during restarts
    socketserver.TCPServer.allow_reuse_address = True
    
    with socketserver.TCPServer(("", port), CORSRequestHandler) as httpd:
        print(f"Serving files from: {directory}")
        print(f"Listening on port: {port}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopping server.")
            httpd.shutdown()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Simple Python Web Server")
    parser.add_argument("--port", type=int, required=True, help="Port to listen on")
    parser.add_argument("--dir", type=str, default="alice/client/dist", help="Directory to serve")
    
    args = parser.parse_args()
    run_server(args.port, args.dir)
