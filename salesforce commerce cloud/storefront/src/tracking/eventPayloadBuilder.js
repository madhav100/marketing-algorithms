function buildStorefrontEvent(eventType, context = {}) {
  return {
    eventType,
    source: 'storefront',
    timestamp: new Date().toISOString(),
    ...context,
  };
}

module.exports = { buildStorefrontEvent };
