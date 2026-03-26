const { OperationalRepository } = require('./db/repositories/operationalRepository');
const { publishDomainEvent } = require('./services/eventPublisher');
const { exportOperationalRecord } = require('./services/dataCloudExportService');
const { createGovernedDataService } = require('./services/governedDataService');
const { createStorefrontController } = require('./api/controllers/storefrontController');
const { createAdminController } = require('./api/controllers/adminController');
const { createGovernedDataController } = require('./api/controllers/governedDataController');

function createServerConnectivityRuntime({ getGovernedOutput, dataCloudDbSyncConsumer }) {
  const repo = new OperationalRepository();

  const storefrontController = createStorefrontController(repo, publishDomainEvent);
  const adminController = createAdminController(
    repo,
    publishDomainEvent,
    exportOperationalRecord,
    dataCloudDbSyncConsumer,
  );

  const governedDataService = createGovernedDataService(getGovernedOutput);
  const governedDataController = createGovernedDataController(governedDataService);

  return {
    repo,
    storefrontController,
    adminController,
    governedDataController,
  };
}

module.exports = { createServerConnectivityRuntime };
