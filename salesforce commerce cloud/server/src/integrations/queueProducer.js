const { publishEvent } = require('./inMemoryEventBus');

function queueProducer(topic, payload) {
  publishEvent(topic, payload);
}

module.exports = { queueProducer };
