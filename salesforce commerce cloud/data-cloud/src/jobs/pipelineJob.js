const { writeToLake } = require('../lake/dataLakeService');
const { mapRawToModel } = require('../model/dataModelMapper');
const { resolveIdentity } = require('../identity/identityResolutionService');
const { calculateInsights } = require('../insights/insightsService');

function runPipelineForEvent(db, event) {
  const rawObject = writeToLake(db, event);
  const modelObject = mapRawToModel(rawObject);
  db.addModelObject(modelObject);
  const profile = resolveIdentity(db, modelObject);
  const insight = calculateInsights(db);

  return { rawObject, modelObject, profile, insight };
}

function runPipelineForPendingEvents(db) {
  const processed = db.streamEvents.map((event) => runPipelineForEvent(db, event));
  return {
    processedCount: processed.length,
    latest: processed[processed.length - 1] || null,
  };
}

module.exports = { runPipelineForEvent, runPipelineForPendingEvents };
