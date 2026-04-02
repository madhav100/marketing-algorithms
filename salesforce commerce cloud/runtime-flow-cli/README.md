# Runtime Flow CLI (3D)

A terminal-only 3D-style animation that visualizes **files + functions used at runtime** as a deep network graph.

## Features
- CLI-only rendering (ANSI + ASCII), no browser required.
- 3D projection with depth shading and camera rotation.
- Multiple topologies: `tree`, `ring`, `mesh`, `scale-free`, `hybrid`.
- Demo runtime pipeline built from this repo's server + storefront layers.
- Live mode support from a JSONL trace file (`--trace`) to animate real runtime events.

## Run
```bash
cd runtime-flow-cli
node src/index.js --topology hybrid
```

## Options
- `--topology <name>`: `tree|ring|mesh|scale-free|hybrid` (default: `hybrid`)
- `--fps <n>`: frame rate (default: `20`)
- `--depth <n>`: graph layer depth multiplier (default: `3`)
- `--trace <path>`: JSONL file path for live events
- `--dry-run`: print summary and exit

## Live trace format
One JSON object per line:
```json
{"from":"storefrontRoutes:GET /checkout","to":"Payments.createIntent","weight":1}
{"from":"Payments.createIntent","to":"orderService.createPaymentOrder","weight":1}
```

Unknown nodes are auto-added to the graph.

## Controls
- `Ctrl+C` to exit.
