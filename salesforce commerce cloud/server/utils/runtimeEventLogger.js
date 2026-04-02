const fs = require('fs/promises');
const path = require('path');

const TRACE_FILE_PATH = process.env.RUNTIME_FLOW_TRACE_PATH
  ? path.resolve(process.env.RUNTIME_FLOW_TRACE_PATH)
  : path.join(__dirname, '../../runtime-flow-cli/runtime-events.jsonl');

async function logRuntimeEdge(from, to, weight = 1, meta = {}) {
  const payload = {
    from,
    to,
    weight,
    ts: new Date().toISOString(),
    ...meta,
  };

  try {
    await fs.mkdir(path.dirname(TRACE_FILE_PATH), { recursive: true });
    await fs.appendFile(TRACE_FILE_PATH, `${JSON.stringify(payload)}\n`, 'utf8');
  } catch (error) {
    // best effort logging; do not block request lifecycle
  }
}

module.exports = {
  TRACE_FILE_PATH,
  logRuntimeEdge,
};
