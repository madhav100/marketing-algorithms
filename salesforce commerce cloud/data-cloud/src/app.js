const { InMemoryDatabase } = require('./dal/inMemoryDatabase');
const { buildHandlers } = require('./api/handlers');
const { createRouter } = require('./routes/router');

function createApp() {
  const db = new InMemoryDatabase();
  const handlers = buildHandlers(db);
  const router = createRouter(handlers);

  return {
    db,
    async handle(req, res) {
      return router(req, res);
    },
  };
}

module.exports = { createApp };
