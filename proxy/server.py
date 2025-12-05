from flask import Flask, request, Response
import requests
import sys

app = Flask(__name__)

# Configuration
ALICE_URL = 'http://localhost:8001'
BOB_URL = 'http://localhost:8002'
PORT = 8000

@app.route('/')
def index():
    """Serve the main landing page."""
    return '''
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Proxy Server</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                background-color: #f0f2f5;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            .container {
                background: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                text-align: center;
                width: 300px;
            }
            h1 {
                color: #1a1a1a;
                margin-bottom: 1.5rem;
            }
            .link-card {
                display: block;
                padding: 1rem;
                margin: 0.5rem 0;
                background-color: #e3f2fd;
                color: #1565c0;
                text-decoration: none;
                border-radius: 4px;
                transition: background-color 0.2s;
                font-weight: 500;
            }
            .link-card:hover {
                background-color: #bbdefb;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Proxy</h1>
            <a href="http://0.0.0.0:8001/" class="link-card">Alice Client</a>
            <a href="http://0.0.0.0:8002/" class="link-card">Bob Client</a>
        </div>
    </body>
    </html>
    '''

# def proxy_request(base_url, path):
#     """Forward request to the backend server."""
#     target_url = f"{base_url}/{path}"
    
#     # Debug log
#     print(f"Proxying {request.method} {request.path} -> {target_url}", file=sys.stderr)
    
#     try:
#         # Forward the request
#         resp = requests.request(
#             method=request.method,
#             url=target_url,
#             headers={key: value for (key, value) in request.headers if key != 'Host'},
#             data=request.get_data(),
#             cookies=request.cookies,
#             allow_redirects=False
#         )
        
#         # Filter headers that should not be forwarded
#         excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
#         headers = [(name, value) for (name, value) in resp.raw.headers.items()
#                    if name.lower() not in excluded_headers]
        
#         return Response(resp.content, resp.status_code, headers)
        
#     except requests.exceptions.ConnectionError:
#         return Response(
#             f'''
#             <html><body>
#             <h3>Error: Could not connect to backend.</h3>
#             <p>Tried to reach: {target_url}</p>
#             <p>Ensure the service is running on {base_url}.</p>
#             </body></html>
#             ''', 
#             status=502
#         )
#     except Exception as e:
#         return Response(f"Proxy Error: {str(e)}", status=500)

# # Catch-all route for Alice
# @app.route('/alice/', defaults={'path': ''}, methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'])
# @app.route('/alice/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'])
# def proxy_alice(path):
#     return proxy_request(ALICE_URL, path)

# # Catch-all route for Bob
# @app.route('/bob/', defaults={'path': ''}, methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'])
# @app.route('/bob/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'])
# def proxy_bob(path):
#     return proxy_request(BOB_URL, path)

if __name__ == '__main__':
    print(f"Starting proxy server on port {PORT}...")
    app.run(host='0.0.0.0', port=PORT, debug=True)
