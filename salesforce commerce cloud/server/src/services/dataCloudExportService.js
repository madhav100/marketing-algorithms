const { pushDbSyncRecord } = require('../integrations/dataCloudAdapter');

function exportOperationalRecord(dataCloudDbSyncConsumer, recordType, data) {
  // Async copy only (one-way): operational DB -> Data Cloud.
  return pushDbSyncRecord(dataCloudDbSyncConsumer, recordType, data);
}

module.exports = { exportOperationalRecord };
