# walmart

This is the canonical storefront implementation for the project.

## What is hosted by the server

The integration server at `../server/app.js` now serves Walmart as the primary storefront:

- `GET /` and `GET /walmart` → Walmart homepage template
- `GET /product/:id` → Walmart product detail template
- `GET /cart` → Walmart cart template
- `/client/*` static assets → `walmart/cartridge/client/*`

## Relationship to admin-console

- Admin UI is served from `../admin-console/admin-console-panel` at `/admin`.
- Shared APIs (`/api/products`, `/api/categories`, `/api/orders`) are hosted by the same server.
- Admin Console persistence is file-based in `../admin-console/database/data`.

See `../RUNNING_INSTRUCTIONS.md` for run commands.
