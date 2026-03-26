const { sendJson } = require('../utils/http');

function createRouter(handlers) {
  return async function route(req, res) {
    const url = new URL(req.url, 'http://localhost');

    if (req.method === 'GET' && url.pathname === '/health') {
      return handlers.health(req, res);
    }

    if (req.method === 'POST' && url.pathname === '/api/ingest/events') {
      return handlers.ingestEvent(req, res);
    }

    if (req.method === 'POST' && url.pathname === '/api/ingest/import') {
      return handlers.ingestImport(req, res);
    }

    if (req.method === 'GET' && url.pathname === '/api/insights/summary') {
      return handlers.getInsights(req, res);
    }

    if (req.method === 'POST' && url.pathname === '/api/jobs/run') {
      return handlers.runJob(req, res);
    }

    const profileMatch = url.pathname.match(/^\/api\/profiles\/(up_[A-Za-z0-9-]+)$/);
    if (req.method === 'GET' && profileMatch) {
      return handlers.getProfile(req, res, { unifiedProfileId: profileMatch[1] });
    }

    return sendJson(res, 404, { error: 'Not found' });
  };
}

module.exports = { createRouter };
