const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 8123;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function proxyRequest(targetUrl, options, res) {
  const req = https.request(targetUrl, options, (proxyRes) => {
    let data = [];
    proxyRes.on('data', (chunk) => data.push(chunk));
    proxyRes.on('end', () => {
      const body = Buffer.concat(data);
      res.writeHead(proxyRes.statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(body);
    });
  });
  req.on('error', (e) => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: e.message }));
  });
  req.setTimeout(15000, () => {
    req.destroy();
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Request timeout' }));
  });
  return req;
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url.startsWith('/api/')) {
    const target = 'https://telecom-packages.vercel.app' + req.url;
    const proxyReq = proxyRequest(target, {
      method: 'GET',
      headers: { 'User-Agent': 'ZolZolZol-Landing/1.0' },
    }, res);
    proxyReq.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/api/saveLead') {
    let body = [];
    req.on('data', (chunk) => body.push(chunk));
    req.on('end', () => {
      const target = 'https://www.zolzolzol.co.il/api/saveLead';
      const postData = Buffer.concat(body);
      const proxyReq = proxyRequest(target, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postData.length,
          'User-Agent': 'ZolZolZol-Landing/1.0',
        },
      }, res);
      proxyReq.write(postData);
      proxyReq.end();
    });
    return;
  }

  // Static file serving
  let filePath = path.join(ROOT, req.url === '/' ? 'index.html' : req.url);
  filePath = decodeURIComponent(filePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const stream = fs.createReadStream(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    stream.pipe(res);
    stream.on('error', () => {
      res.writeHead(500);
      res.end('Internal Server Error');
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
