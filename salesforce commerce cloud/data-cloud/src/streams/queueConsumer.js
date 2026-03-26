const { consumeEvent } = require('../../../server/src/integrations/inMemoryEventBus');

function registerQueueConsumers(ingestionController) {
  const topics = ['storefront.events', 'admin.events', 'order.events', 'product.events', 'customer.events'];

  for (const topic of topics) {
    consumeEvent(topic, (message) => {
      ingestionController.ingestEvent({
        body: {
          source: message.payload.source || topic,
          type: message.eventType,
          occurredAt: message.metadata.publishedAt,
          payload: message.payload,
        },
      });
    });
  }
}

module.exports = { registerQueueConsumers };
