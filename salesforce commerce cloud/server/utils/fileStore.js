const fs = require('fs/promises');
const path = require('path');

const dataDir = path.join(__dirname, '../../data');

// Safely read JSON data from a shared file.
async function readJsonFile(fileName) {
  const filePath = path.join(dataDir, fileName);
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content || '[]');
}

// Safely write JSON data to a shared file.
async function writeJsonFile(fileName, data) {
  const filePath = path.join(dataDir, fileName);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = {
  readJsonFile,
  writeJsonFile,
};
