# Data Console

This top-level folder is an independent workspace.

## Structure
- `data cloud/` — standalone data cloud with 5 customer CSV streams, governance, and data objects lake.
- `dashboard view/` — modular, component-based dashboard UI (pluggable admin dashboard) plus a data explorer template.

## Quick start (recommended)
```bash
# from repository root
cd "data console"
npm install
npm run serve
```

Open in browser:
- Dashboard: `http://localhost:8787/dashboard%20view/index.html`
- Explorer: `http://localhost:8787/dashboard%20view/data-explorer-template.html`

### Run ingest from the UI
1. Open the dashboard URL.
2. Click **Run Ingest**.
3. Wait for status to change to **HEALTHY** and metrics/speedometers to update.

## CLI ingestion commands
```bash
# one-time ingest
cd "data console/data cloud"
npm run ingest

# watch CSV updates
npm run ingest:watch
```

## API endpoints (served by `npm run serve`)
- `POST /api/ingest` — triggers ingestion and returns updated summary.
- `GET /api/summary` — returns current `lake-summary.json`.

## Dashboard architecture
- `dashboard view/js/components/*` — reusable UI components.
- `dashboard view/js/plugins/pipelinePlugin.js` — pluggable dashboard module.
- `dashboard view/js/app.js` — plugin bootstrap.
