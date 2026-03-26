const crypto = require('node:crypto');

function mapRawToModel(rawObject) {
  const payload = rawObject.rawPayload || {};

  return {
    modelObjectId: `dmo_${crypto.randomUUID()}`,
    objectType: inferObjectType(rawObject.type),
    source: rawObject.source,
    identifiers: {
      email: payload.email || null,
      customerId: payload.customerId || null,
      phone: payload.phone || null,
      deviceId: payload.deviceId || null,
    },
    attributes: {
      orderValue: payload.orderValue || 0,
      sku: payload.sku || null,
      quantity: payload.quantity || 0,
      eventType: rawObject.type,
      occurredAt: payload.occurredAt || rawObject.receivedAt,
    },
    mappedAt: new Date().toISOString(),
  };
}

function inferObjectType(eventType) {
  if (eventType.startsWith('order')) return 'OrderEvent';
  if (eventType.startsWith('product')) return 'ProductEvent';
  return 'EngagementEvent';
}

module.exports = { mapRawToModel };
