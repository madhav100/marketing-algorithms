const crypto = require('node:crypto');
const { maskPii, governanceAuditEntry } = require('../governance/governanceService');

function writeToLake(db, streamEvent) {
  const raw = {
    rawObjectId: `raw_${crypto.randomUUID()}`,
    schemaVersion: '1.0',
    source: streamEvent.source,
    type: streamEvent.type,
    receivedAt: streamEvent.ingestedAt,
    rawPayload: streamEvent.payload,
    protectedPayload: maskPii(streamEvent.payload),
  };

  db.addRawObject(raw);
  db.addAudit(governanceAuditEntry('lake_write', { rawObjectId: raw.rawObjectId }));

  return raw;
}

module.exports = { writeToLake };
