# Data Cloud

This folder contains a standalone **Data Objects Lake**, **Data Governance checks**, and **CSV data streams** for the independent Data Console workspace.

## What is implemented
- **5 customer CSV export types** in `csv-exports/`:
  - `customer_profiles.csv`
  - `customer_orders.csv`
  - `customer_subscriptions.csv`
  - `customer_returns.csv`
  - `customer_support_tickets.csv`
- **Data stream ingestion**: `src/csvDataStream.js` reads CSV files in streaming mode.
- **Data governance validator**: `src/dataGovernance.js` enforces key, numeric, and date standards.
- **Data objects lake**: `src/dataObjectsLake.js` upserts records into entity collections.
- **Data model reference**: `data-model.md` documents entities and relationships for revenue analysis.
- **Governance policy**: `data-governance.md` defines quality/privacy/freshness/access/integrity rules.
- **Persisted outputs**:
  - `data/objects-lake.json`
  - `data/lake-summary.json`

## Bash instructions
```bash
# from repo root
cd "data console/data cloud"

# install project deps
npm install

# run ingestion once (rebuilds lake from current CSV exports)
npm run ingest

# watch csv exports and auto-refresh the lake
npm run ingest:watch
```

## CSV export flow
```bash
# copy your latest customer exports
cp /path/to/customer_profiles.csv "data console/data cloud/csv-exports/customer_profiles.csv"
cp /path/to/customer_orders.csv "data console/data cloud/csv-exports/customer_orders.csv"
cp /path/to/customer_subscriptions.csv "data console/data cloud/csv-exports/customer_subscriptions.csv"
cp /path/to/customer_returns.csv "data console/data cloud/csv-exports/customer_returns.csv"
cp /path/to/customer_support_tickets.csv "data console/data cloud/csv-exports/customer_support_tickets.csv"

# ingest updates
cd "data console/data cloud"
npm run ingest
```
