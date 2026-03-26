function requireFields(payload, fields) {
  const missing = fields.filter((field) => payload[field] === undefined);
  return { valid: missing.length === 0, missing };
}

module.exports = { requireFields };
