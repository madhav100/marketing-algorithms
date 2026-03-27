# Data Cloud

This folder contains a standalone **Data Objects Lake** and **CSV data streams** for the independent Data Console workspace.

## What is implemented
- **CSV exports input**: place source files in `csv-exports/`.
- **Data stream ingestion**: `src/csvDataStream.js` reads CSV files in streaming mode.
- **Data objects lake**: `src/dataObjectsLake.js` upserts records into entity collections.
- **Persisted lake data**: written to `data/objects-lake.json`.
- **Operational summary**: written to `data/lake-summary.json` after each ingestion.

## Bash instructions
```bash
# from repo root
cd "data console/data cloud"

# install deps (none external, but this verifies npm project)
npm install

# run ingestion once
npm run ingest

# watch csv exports and auto-refresh the lake
npm run ingest:watch
```

## CSV export flow
```bash
# add/update exports
cp /path/to/customers.csv "data console/data cloud/csv-exports/customers.csv"
cp /path/to/orders.csv "data console/data cloud/csv-exports/orders.csv"

# ingest updates
cd "data console/data cloud"
npm run ingest
```

When CSV files are updated or replaced, the data lake is refreshed from the exports.
