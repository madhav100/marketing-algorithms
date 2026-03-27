# Data Console

This top-level folder is an independent workspace.

## Structure
- `data cloud/` — standalone data cloud with 5 customer CSV streams, governance, and data objects lake.
- `dashboard view/` — modular, component-based dashboard UI (pluggable admin dashboard) plus a data explorer template.

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
# Open pipeline dashboard template
xdg-open "data console/dashboard view/index.html"

# Open data explorer template
xdg-open "data console/dashboard view/data-explorer-template.html"
```


## Run local HTML server
```bash
# from repo root
cd "data console"
npm install
npm run serve

# then open
# http://localhost:8787/dashboard%20view/index.html
# http://localhost:8787/dashboard%20view/data-explorer-template.html
```


## Dashboard architecture
```bash
# dashboard modules
# - dashboard view/js/components/*
# - dashboard view/js/plugins/pipelinePlugin.js
# - dashboard view/js/app.js
```
