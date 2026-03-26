const { ingestStreamRecord } = require('../../streams/ingestionService');
const { runPipelineForEvent } = require('../../jobs/pipelineJob');

function createIngestionController(db) {
  return {
    ingestEvent(req) {
      const result = ingestStreamRecord(db, req.body);
      if (result.accepted) runPipelineForEvent(db, result.event);
      return result;
    },

    ingestDbSync(req) {
      const { recordType, data } = req.body;
      const event = {
        source: 'operational-db-sync',
        type: `${recordType}.synced`,
        occurredAt: new Date().toISOString(),
        payload: data,
      };
      const result = ingestStreamRecord(db, event);
      if (result.accepted) runPipelineForEvent(db, result.event);
      return result;
    },
  };
}

module.exports = { createIngestionController };
