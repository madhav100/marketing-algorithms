const { ingestStreamRecord } = require('../streams/ingestionService');
const { runPipelineForEvent, runPipelineForPendingEvents } = require('../jobs/pipelineJob');
const { calculateInsights } = require('../insights/insightsService');
const { sendJson, readJsonBody } = require('../utils/http');
const { renderTemplate } = require('../utils/templateRenderer');

function buildHandlers(db) {
  return {
    async homePage(_req, res) {
      renderTemplate(res, 'index.html');
    },

    async pipelinePage(_req, res) {
      renderTemplate(res, 'pipeline.html');
    },

    async governancePage(_req, res) {
      renderTemplate(res, 'governance.html');
    },

    async health(_req, res) {
      sendJson(res, 200, { status: 'ok', service: 'data-cloud' });
    },

    async ingestEvent(req, res) {
      const payload = await readJsonBody(req);
      const result = ingestStreamRecord(db, payload);

      if (!result.accepted) {
        sendJson(res, 400, result);
        return;
      }

      const pipeline = runPipelineForEvent(db, result.event);
      sendJson(res, 201, {
        accepted: true,
        eventId: result.event.eventId,
        unifiedProfileId: pipeline.profile.unifiedProfileId,
      });
    },

    async ingestImport(req, res) {
      const body = await readJsonBody(req);
      const records = Array.isArray(body.records) ? body.records : [];
      const outcomes = [];

      for (const record of records) {
        const result = ingestStreamRecord(db, record);
        if (result.accepted) {
          runPipelineForEvent(db, result.event);
        }
        outcomes.push(result);
      }

      sendJson(res, 200, {
        accepted: outcomes.filter((o) => o.accepted).length,
        rejected: outcomes.filter((o) => !o.accepted).length,
      });
    },

    async getProfile(_req, res, params) {
      const profile = db.getProfileByUnifiedId(params.unifiedProfileId);
      if (!profile) {
        sendJson(res, 404, { error: 'Profile not found' });
        return;
      }
      sendJson(res, 200, profile);
    },

    async getInsights(_req, res) {
      const latest = db.insightSnapshots[db.insightSnapshots.length - 1] || calculateInsights(db);
      sendJson(res, 200, latest);
    },

    async runJob(_req, res) {
      const result = runPipelineForPendingEvents(db);
      sendJson(res, 200, result);
    },
  };
}

module.exports = { buildHandlers };
