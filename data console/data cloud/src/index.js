const fs = require('fs');
const path = require('path');
const DataObjectsLake = require('./dataObjectsLake');
const { ingestAllCsv } = require('./csvDataStream');

const ROOT = path.resolve(__dirname, '..');
const CSV_EXPORTS = path.join(ROOT, 'csv-exports');
const OBJECTS_LAKE_FILE = path.join(ROOT, 'data', 'objects-lake.json');
const SUMMARY_FILE = path.join(ROOT, 'data', 'lake-summary.json');

async function runIngestion() {
  const lake = new DataObjectsLake(OBJECTS_LAKE_FILE);
  lake.load();

  if (!fs.existsSync(CSV_EXPORTS)) {
    fs.mkdirSync(CSV_EXPORTS, { recursive: true });
  }

  const files = await ingestAllCsv(CSV_EXPORTS, lake);
  lake.persist();

  const summary = {
    processedCsvFiles: files,
    ...lake.getSummary()
  };

  fs.writeFileSync(SUMMARY_FILE, JSON.stringify(summary, null, 2));

  console.log('Ingestion complete.');
  console.log(`Processed files: ${files.length}`);
  console.log(`Summary saved to: ${SUMMARY_FILE}`);
}

function runWatchMode() {
  console.log(`Watching CSV exports in: ${CSV_EXPORTS}`);
  runIngestion().catch((error) => {
    console.error('Initial ingestion failed:', error);
  });

  fs.watch(CSV_EXPORTS, { persistent: true }, (eventType, filename) => {
    if (!filename || !filename.endsWith('.csv')) {
      return;
    }

    console.log(`[${new Date().toISOString()}] ${eventType} detected for ${filename}`);
    runIngestion().catch((error) => {
      console.error('Ingestion failed after change event:', error);
    });
  });
}

if (process.argv.includes('--watch')) {
  runWatchMode();
} else {
  runIngestion().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
