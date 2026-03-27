# Data Cloud

This folder contains a standalone **Data Objects Lake**, **Data Governance checks**, and **CSV data streams** for the independent Data Console workspace.

## CSV sources (5 customer export types)
- `customer_profiles.csv`
- `customer_orders.csv`
- `customer_subscriptions.csv`
- `customer_returns.csv`
- `customer_support_tickets.csv`

## What the pipeline does
- Reads CSV files from `csv-exports/`.
- Validates records using governance rules in `src/dataGovernance.js`.
- Upserts records into the objects lake via `src/dataObjectsLake.js`.
- Persists outputs to runtime-generated files:
  - `data/objects-lake.json`
  - `data/lake-summary.json`

> Note: files in `data/` are generated during ingestion and are not source-controlled.

## Run from CLI
```bash
# from repo root
cd "data console/data cloud"
npm install
npm run ingest
```

## Watch mode
```bash
cd "data console/data cloud"
npm run ingest:watch
```

## Run ingest from dashboard button
```bash
cd "data console"
npm run serve
```
Then use `POST /api/ingest` via the dashboard **Run Ingest** button.

## References
- Data model: `data-model.md`
- Governance policy: `data-governance.md`
