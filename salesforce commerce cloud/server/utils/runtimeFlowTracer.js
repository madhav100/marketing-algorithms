const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

const TRACE_DIR = path.join(__dirname, '../runtime-flow');
const TRACE_FILE = path.join(TRACE_DIR, 'events.jsonl');

async function ensureTraceDir() {
  await fsPromises.mkdir(TRACE_DIR, { recursive: true });
}

function sanitize(label) {
  return String(label || 'unknown').replace(/\s+/g, ' ').trim().slice(0, 180);
}

function emitRuntimeFlow(from, to, meta = {}) {
  try {
    if (!fs.existsSync(TRACE_DIR)) {
      fs.mkdirSync(TRACE_DIR, { recursive: true });
    }

    const payload = {
      at: new Date().toISOString(),
      from: sanitize(from),
      to: sanitize(to),
      weight: Number(meta.weight || 1),
      ...meta,
    };
    fs.appendFileSync(TRACE_FILE, `${JSON.stringify(payload)}\n`, 'utf8');
  } catch (error) {
    // non-fatal diagnostics path
  }
}

module.exports = {
  TRACE_DIR,
  TRACE_FILE,
  ensureTraceDir,
  emitRuntimeFlow,
};
