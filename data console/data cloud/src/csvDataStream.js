const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { validateRecord } = require('./dataGovernance');

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      const isEscapedQuote = line[i + 1] === '"';
      if (isEscapedQuote) {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function inferEntityName(filePath) {
  return path.basename(filePath, path.extname(filePath)).toLowerCase();
}

async function streamCsvIntoLake(filePath, dataLake) {
  const stream = fs.createReadStream(filePath, 'utf8');
  const lineReader = readline.createInterface({ input: stream, crlfDelay: Infinity });

  const entityName = inferEntityName(filePath);
  let headers = null;

  for await (const line of lineReader) {
    if (!line.trim()) {
      continue;
    }

    if (!headers) {
      headers = parseCsvLine(line);
      continue;
    }

    const values = parseCsvLine(line);
    const record = headers.reduce((acc, header, index) => {
      const raw = values[index] ?? '';
      const asNumber = Number(raw);
      acc[header] = Number.isNaN(asNumber) || raw === '' ? raw : asNumber;
      return acc;
    }, {});

    const validation = validateRecord(entityName, record);
    if (!validation.valid) {
      console.warn(`Skipped invalid record in ${entityName}: ${validation.errors.join('; ')}`);
      continue;
    }

    dataLake.upsert(entityName, record);
  }

  dataLake.markIngestion(path.basename(filePath));
}

async function ingestAllCsv(csvFolderPath, dataLake) {
  const fileNames = fs
    .readdirSync(csvFolderPath)
    .filter((name) => name.toLowerCase().endsWith('.csv'))
    .sort();

  for (const name of fileNames) {
    const fullPath = path.join(csvFolderPath, name);
    await streamCsvIntoLake(fullPath, dataLake);
  }

  return fileNames;
}

module.exports = {
  ingestAllCsv,
  streamCsvIntoLake
};
