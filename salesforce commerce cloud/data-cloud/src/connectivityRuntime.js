const { InMemoryDatabase } = require('./dal/inMemoryDatabase');
const { createIngestionController } = require('./api/controllers/ingestionController');
const { createGovernedPublisher } = require('./integrations/governedPublisher');
const { createDatabaseSyncConsumer } = require('./streams/databaseSyncConsumer');
const { registerQueueConsumers } = require('./streams/queueConsumer');

function createDataCloudConnectivityRuntime() {
  const db = new InMemoryDatabase();
  const ingestionController = createIngestionController(db);
  const getGovernedOutput = createGovernedPublisher(db);
  const dbSyncConsumer = createDatabaseSyncConsumer(ingestionController);

  registerQueueConsumers(ingestionController);

  return {
    db,
    ingestionController,
    getGovernedOutput,
    dbSyncConsumer,
  };
}

module.exports = { createDataCloudConnectivityRuntime };
