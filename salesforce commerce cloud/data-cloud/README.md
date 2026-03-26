# Data Cloud Service

A backend-only Data Cloud-like service that ingests commerce data and processes it through:

1. Data Streams
2. Data Lake Objects (raw)
3. Data Model Objects (normalized)
4. Identity Resolution
5. Calculated Insights
6. Governance

## Scope

This folder intentionally contains only backend service code for `data-cloud/` and no storefront/admin UI.

## Quick start

```bash
node src/server.js
```

Runs on `http://localhost:5050` by default.

## API endpoints

- `GET /health`
- `POST /api/ingest/events`
- `POST /api/ingest/import`
- `GET /api/profiles/:unifiedProfileId`
- `GET /api/insights/summary`
- `POST /api/jobs/run`

## Tests

```bash
node --test tests/*.test.js
```
