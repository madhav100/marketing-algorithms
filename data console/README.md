# Data Console

This top-level folder is an independent workspace.

## Structure
- `data cloud/` — standalone data cloud with CSV streams and data objects lake.
- `dashboard view/` — webpage UI for pipeline concepts and relationships.

This implementation is intentionally separated from other project folders.

## Bash instructions
```bash
# 1) Go to data cloud
cd "data console/data cloud"

# 2) Run one-time CSV ingestion
npm run ingest

# 3) (Optional) Watch CSV updates continuously
npm run ingest:watch
```

```bash
# Open the dashboard locally from repository root
xdg-open "data console/dashboard view/index.html"
```
