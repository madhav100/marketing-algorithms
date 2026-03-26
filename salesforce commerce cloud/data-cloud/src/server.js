const http = require('node:http');
const { createApp } = require('./app');
const { config } = require('./config');

const app = createApp();

const server = http.createServer((req, res) => {
  app.handle(req, res).catch((error) => {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error', details: error.message }));
  });
});

server.listen(config.port, () => {
  console.log(`[data-cloud] listening on port ${config.port}`);
});
