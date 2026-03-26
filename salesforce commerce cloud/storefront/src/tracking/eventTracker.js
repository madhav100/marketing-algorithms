const { apiClient } = require('../services/apiClient');
const { buildStorefrontEvent } = require('./eventPayloadBuilder');

async function trackEvent(eventType, context) {
  const payload = buildStorefrontEvent(eventType, context);
  // Guard: Storefront must never send events directly to Data Cloud.
  return apiClient('/api/storefront/order/create', {
    method: 'POST',
    body: JSON.stringify({ trackingOnly: true, trackingPayload: payload }),
  });
}

module.exports = { trackEvent };
