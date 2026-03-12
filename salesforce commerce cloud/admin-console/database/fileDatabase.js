const fs = require('fs/promises');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

function getFilePath(fileName) {
  return path.join(DATA_DIR, fileName);
}

async function ensureDataFile(fileName) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const filePath = getFilePath(fileName);

  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, '[]\n', 'utf8');
  }

  return filePath;
}

async function readCollection(fileName) {
  const filePath = await ensureDataFile(fileName);
  const payload = await fs.readFile(filePath, 'utf8');
  return JSON.parse(payload || '[]');
}

async function writeCollection(fileName, records) {
  const filePath = await ensureDataFile(fileName);
  await fs.writeFile(filePath, `${JSON.stringify(records, null, 2)}\n`, 'utf8');
}

module.exports = {
  readCollection,
  writeCollection,
};
