# Data Cloud

This folder contains a standalone **Data Objects Lake** and **CSV data streams** for the independent Data Console workspace.

## What is implemented
- **CSV exports input**: place source files in `csv-exports/`.
- **Data stream ingestion**: `src/csvDataStream.js` reads CSV files in streaming mode.
- **Data objects lake**: `src/dataObjectsLake.js` upserts records into entity collections.
- **Persisted lake data**: written to `data/objects-lake.json`.
- **Operational summary**: written to `data/lake-summary.json` after each ingestion.

## Run
```bash
cd "data console/data cloud"
npm run ingest
```

## Watch mode
```bash
cd "data console/data cloud"
npm run ingest:watch
```

When CSV files are updated or replaced, the data lake is refreshed from the exports.
