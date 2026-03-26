class InMemoryDatabase {
  constructor() {
    this.streamEvents = [];
    this.rawLakeObjects = [];
    this.modelObjects = [];
    this.identities = new Map();
    this.insightSnapshots = [];
    this.auditLog = [];
  }

  addStreamEvent(event) { this.streamEvents.push(event); }
  addRawObject(raw) { this.rawLakeObjects.push(raw); }
  addModelObject(model) { this.modelObjects.push(model); }

  upsertIdentity(identityKey, profile) {
    this.identities.set(identityKey, profile);
  }

  addInsight(snapshot) { this.insightSnapshots.push(snapshot); }
  addAudit(logEntry) { this.auditLog.push(logEntry); }

  getProfileByUnifiedId(unifiedProfileId) {
    return [...this.identities.values()].find((p) => p.unifiedProfileId === unifiedProfileId) || null;
  }
}

module.exports = { InMemoryDatabase };
