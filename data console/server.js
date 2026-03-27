const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 8787);
const ROOT = __dirname;

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

function send(res, statusCode, body, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(statusCode, { 'Content-Type': contentType });
  res.end(body);
}

function safeResolve(requestPath) {
  const normalized = requestPath === '/' ? '/dashboard view/index.html' : requestPath;
  const decoded = decodeURIComponent(normalized);
  const fullPath = path.resolve(ROOT, `.${decoded}`);

  if (!fullPath.startsWith(ROOT)) {
    return null;
  }

  return fullPath;
}

function serveFile(filePath, res) {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      send(res, 404, 'Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = contentTypes[ext] || 'application/octet-stream';

    const stream = fs.createReadStream(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    stream.pipe(res);

    stream.on('error', () => {
      send(res, 500, 'Server error');
    });
  });
}

const server = http.createServer((req, res) => {
  const filePath = safeResolve(req.url || '/');

  if (!filePath) {
    send(res, 400, 'Invalid path');
    return;
  }

  serveFile(filePath, res);
});

server.listen(PORT, () => {
  console.log(`Data Console server running at http://localhost:${PORT}`);
  console.log('Dashboard: /dashboard view/index.html');
  console.log('Explorer: /dashboard view/data-explorer-template.html');
});
