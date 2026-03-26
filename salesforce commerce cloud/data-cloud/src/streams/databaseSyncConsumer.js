function createDatabaseSyncConsumer(ingestionController) {
  return function databaseSyncConsumer(message) {
    return ingestionController.ingestDbSync({ body: message });
  };
}

module.exports = { createDatabaseSyncConsumer };
