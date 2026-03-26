let eventCounter = 0;

function createSessionEvent({ sessionId, customerId = 'guest', eventType, eventData = {}, createdAt }) {
  eventCounter += 1;
  return {
    id: `evt_${eventCounter}`,
    sessionId,
    customerId,
    eventType,
    eventData,
    createdAt,
  };
}

module.exports = { createSessionEvent };
