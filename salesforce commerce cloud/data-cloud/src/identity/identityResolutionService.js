const crypto = require('node:crypto');

function resolveIdentity(db, modelObject) {
  const key =
    modelObject.identifiers.email ||
    modelObject.identifiers.customerId ||
    modelObject.identifiers.phone ||
    modelObject.identifiers.deviceId ||
    `anonymous:${modelObject.modelObjectId}`;

  const existing = db.identities.get(key);
  if (existing) {
    existing.events.push(modelObject.modelObjectId);
    existing.lastSeenAt = new Date().toISOString();
    return existing;
  }

  const profile = {
    unifiedProfileId: `up_${crypto.randomUUID()}`,
    identityKey: key,
    events: [modelObject.modelObjectId],
    createdAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
  };

  db.upsertIdentity(key, profile);
  return profile;
}

module.exports = { resolveIdentity };
