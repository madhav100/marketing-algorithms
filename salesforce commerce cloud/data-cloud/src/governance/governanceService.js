const { config } = require('../config');

function validateStreamRecord(record) {
  const missing = config.governance.requiredStreamFields.filter((field) => record[field] === undefined);
  return { valid: missing.length === 0, missing };
}

function maskPii(payload) {
  if (!payload || typeof payload !== 'object') return payload;
  const masked = { ...payload };

  for (const key of config.governance.piiFields) {
    if (masked[key]) {
      masked[key] = String(masked[key]).replace(/.(?=.{2})/g, '*');
    }
  }

  return masked;
}

function governanceAuditEntry(action, details = {}) {
  return {
    action,
    details,
    recordedAt: new Date().toISOString(),
  };
}

module.exports = {
  validateStreamRecord,
  maskPii,
  governanceAuditEntry,
};
