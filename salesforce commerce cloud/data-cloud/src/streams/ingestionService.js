const crypto = require('node:crypto');
const { validateStreamRecord, governanceAuditEntry } = require('../governance/governanceService');

function ingestStreamRecord(db, input) {
  const validation = validateStreamRecord(input);
  if (!validation.valid) {
    return {
      accepted: false,
      error: `Missing required fields: ${validation.missing.join(', ')}`,
    };
  }

  const event = {
    eventId: `evt_${crypto.randomUUID()}`,
    source: input.source,
    type: input.type,
    occurredAt: input.occurredAt,
    payload: input.payload,
    ingestedAt: new Date().toISOString(),
  };

  db.addStreamEvent(event);
  db.addAudit(governanceAuditEntry('stream_ingested', { eventId: event.eventId, source: event.source }));

  return { accepted: true, event };
}

module.exports = { ingestStreamRecord };
