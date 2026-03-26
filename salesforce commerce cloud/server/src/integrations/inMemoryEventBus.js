const topics = new Map();

function publishEvent(topic, payload) {
  const handlers = topics.get(topic) || [];
  for (const handler of handlers) handler(payload);
}

function consumeEvent(topic, handler) {
  const handlers = topics.get(topic) || [];
  handlers.push(handler);
  topics.set(topic, handlers);
}

module.exports = { publishEvent, consumeEvent };
