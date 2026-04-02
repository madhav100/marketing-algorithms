# Runtime Flow CLI (3D)

A terminal-only 3D-style animation that visualizes **files + functions used at runtime** as a deep network graph.

## Features
- CLI-only rendering (ANSI + ASCII), no browser required.
- 3D projection with depth shading and camera rotation.
- Multiple topologies: `tree`, `ring`, `mesh`, `scale-free`, `hybrid`.
- Localhost-aware mode that maps live Walmart storefront + server + admin-console connections.
- Live mode support from a JSONL trace file (`--trace`) to animate real runtime events.

## Run
```bash
cd runtime-flow-cli
node src/index.js --mode localhost --topology hybrid
```

## Localhost mode (recommended)
By default, the visualizer now runs in `localhost` mode and seeds the graph with the real integration links. In this mode, pulse activity comes from live trace events (not demo auto-pulsing):
- `storefront` (`/walmart`, `/cart`, `/checkout`) 
- shared `server` APIs (`/api/products`, `/api/orders`, `/api/admin/*`)
- `admin-console` (`/admin`, `/api/admin/health`)

The header also shows service probe status (`up(code)` or `down`) so you can confirm connectivity while the live stack is running.

When running localhost mode, the CLI tails `runtime-flow-cli/runtime-events.jsonl` by default. This file is written by request middleware in:
- `server/app.js` (integrated server on :3000)
- `admin-console/node-express-backend/src/app.js` (standalone admin backend on :4000)

## Options
- `--mode <name>`: `localhost|demo` (default: `localhost`)
- `--topology <name>`: `tree|ring|mesh|scale-free|hybrid` (default: `hybrid`)
- `--fps <n>`: frame rate (default: `20`)
- `--depth <n>`: graph layer depth multiplier (default: `3`)
- `--trace <path>`: JSONL file path for live events
- `--storefront-base <url>`: storefront base URL (default: `http://localhost:3000`)
- `--server-base <url>`: server base URL (default: `http://localhost:3000`)
- `--admin-base <url>`: admin-console backend URL (default: `http://localhost:4000`)
- `--timeout-ms <n>`: service probe timeout in milliseconds (default: `1200`)
- `--dry-run`: print summary and exit

You can also set:
- `STOREFRONT_BASE_URL`
- `SERVER_BASE_URL`
- `ADMIN_BASE_URL`
- `LOCALHOST_PROBE_TIMEOUT_MS`

## Live trace format
One JSON object per line:
```json
{"from":"storefrontRoutes:GET /checkout","to":"Payments.createIntent","weight":1}
{"from":"Payments.createIntent","to":"orderService.createPaymentOrder","weight":1}
```

Unknown nodes are auto-added to the graph.

## Controls
- `Ctrl+C` to exit.
