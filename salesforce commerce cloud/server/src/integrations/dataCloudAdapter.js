// Inner-scope adapter only. Outer-scope clients must never call Data Cloud directly.
function pushDbSyncRecord(dataCloudDbSyncConsumer, recordType, data) {
  return dataCloudDbSyncConsumer({ recordType, data, source: 'operational-db' });
}

module.exports = { pushDbSyncRecord };
