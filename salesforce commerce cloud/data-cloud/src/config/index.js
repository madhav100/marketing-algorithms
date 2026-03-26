const config = {
  serviceName: 'commerce-data-cloud',
  port: Number(process.env.DATA_CLOUD_PORT || 5050),
  lake: {
    maxRecordBytes: 2_000_000,
  },
  governance: {
    piiFields: ['email', 'phone', 'firstName', 'lastName'],
    requiredStreamFields: ['source', 'type', 'occurredAt', 'payload'],
  },
};

module.exports = { config };
