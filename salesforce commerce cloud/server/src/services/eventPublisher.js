const { queueProducer } = require('../integrations/queueProducer');

function publishDomainEvent(topic, eventType, payload) {
  const envelope = {
    eventType,
    topic,
    payload,
    metadata: {
      publishedAt: new Date().toISOString(),
      version: '1.0',
    },
  };

  queueProducer(topic, envelope);
  return envelope;
}

module.exports = { publishDomainEvent };
