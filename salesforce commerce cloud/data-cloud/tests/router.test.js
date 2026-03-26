const test = require('node:test');
const assert = require('node:assert/strict');

const { createApp } = require('../src/app');

function createMockRes() {
  return {
    statusCode: 0,
    headers: {},
    body: '',
    writeHead(status, headers) {
      this.statusCode = status;
      this.headers = headers;
    },
    end(chunk) {
      this.body = chunk || '';
    },
  };
}

test('health route returns ok payload', async () => {
  const app = createApp();
  const req = { method: 'GET', url: '/health' };
  const res = createMockRes();

  await app.handle(req, res);
  const payload = JSON.parse(res.body);

  assert.equal(res.statusCode, 200);
  assert.equal(payload.status, 'ok');
});

test('home route renders html template', async () => {
  const app = createApp();
  const req = { method: 'GET', url: '/' };
  const res = createMockRes();

  await app.handle(req, res);

  assert.equal(res.statusCode, 200);
  assert.match(res.headers['Content-Type'], /text\/html/);
  assert.match(res.body, /Commerce Data Cloud Service/);
});
