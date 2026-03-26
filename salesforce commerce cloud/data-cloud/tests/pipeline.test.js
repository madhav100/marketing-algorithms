const test = require('node:test');
const assert = require('node:assert/strict');

const { InMemoryDatabase } = require('../src/dal/inMemoryDatabase');
const { ingestStreamRecord } = require('../src/streams/ingestionService');
const { runPipelineForEvent } = require('../src/jobs/pipelineJob');

test('event ingestion + pipeline produces lake/model/identity/insight artifacts', () => {
  const db = new InMemoryDatabase();
  const ingestion = ingestStreamRecord(db, {
    source: 'storefront',
    type: 'order.created',
    occurredAt: '2026-03-25T00:00:00.000Z',
    payload: {
      email: 'shopper@example.com',
      orderValue: 85.5,
      customerId: 'C-100',
    },
  });

  assert.equal(ingestion.accepted, true);

  const pipeline = runPipelineForEvent(db, ingestion.event);

  assert.ok(pipeline.rawObject.rawObjectId.startsWith('raw_'));
  assert.ok(pipeline.modelObject.modelObjectId.startsWith('dmo_'));
  assert.ok(pipeline.profile.unifiedProfileId.startsWith('up_'));
  assert.equal(pipeline.insight.totalEvents, 1);
  assert.equal(pipeline.insight.totalProfiles, 1);
  assert.equal(pipeline.insight.grossMerchandiseValue, 85.5);
});

test('invalid stream event is rejected by governance', () => {
  const db = new InMemoryDatabase();
  const ingestion = ingestStreamRecord(db, {
    source: 'csv-import',
    type: 'product.updated',
  });

  assert.equal(ingestion.accepted, false);
  assert.match(ingestion.error, /Missing required fields/);
  assert.equal(db.streamEvents.length, 0);
});
