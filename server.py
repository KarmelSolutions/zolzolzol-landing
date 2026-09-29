import http.server
import urllib.request
import json
import os

class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/api/'):
            target = 'https://telecom-packages.vercel.app' + self.path
            try:
                req = urllib.request.Request(target)
                req.add_header('User-Agent', 'ZolZolZol-Landing/1.0')
                with urllib.request.urlopen(req, timeout=15) as resp:
                    data = resp.read()
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json; charset=utf-8')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(data)
            except Exception as e:
                self.send_response(502)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
        else:
            super().do_GET()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/saveLead':
            target = 'https://www.zolzolzol.co.il/api/saveLead'
            try:
                length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(length)
                req = urllib.request.Request(target, data=body, method='POST')
                req.add_header('Content-Type', 'application/json')
                req.add_header('User-Agent', 'ZolZolZol-Landing/1.0')
                with urllib.request.urlopen(req, timeout=15) as resp:
                    data = resp.read()
                    self.send_response(resp.status)
                    self.send_header('Content-Type', 'application/json; charset=utf-8')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(data)
            except Exception as e:
                self.send_response(502)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
        else:
            self.send_response(404)
            self.end_headers()

os.chdir(os.path.dirname(os.path.abspath(__file__)))
server = http.server.HTTPServer(('', 8123), ProxyHandler)
print('Server running on http://localhost:8123')
server.serve_forever()
