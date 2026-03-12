# marketing-algorithms

## SFCC project structure

This repository includes a Salesforce Commerce Cloud setup with:

- A storefront implementation in SFRA style (`salesforce commerce cloud/walmart`).
- A separate Admin Console implementation (`salesforce commerce cloud/admin-console`) with UI, backend, and database layers.

### Admin Console architecture

```
Admin Console Panel
  ↓
Node/Express Backend
  ↓
Database
```

### Usage direction

- Keep storefront pages, controllers, and cartridge code inside `walmart/`.
- Build internal admin functionality inside `admin-console/` (source of truth for admin UI files).
- Use `server/` only to host/admin-route the admin console and expose APIs; do not create a second admin UI under `server/`.
- Admin backend/database source now lives under `admin-console/node-express-backend` and `admin-console/database` (the old root-level `data/` folder was removed).
- Connect the two through backend APIs/services as needed.
