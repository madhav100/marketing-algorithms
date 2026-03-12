# marketing-algorithms

## SFCC project structure

This repository includes a Salesforce Commerce Cloud setup with:

- A storefront implementation in SFRA style (`salesforce commerce cloud/walmart`) that is the canonical storefront source.
- A separate Admin Console implementation (`salesforce commerce cloud/admin-console`) with UI, backend, and database layers.
- A local Node/Express integration layer (`salesforce commerce cloud/server`) that hosts the Walmart storefront homepage, admin UI, and shared APIs.

### Admin + storefront architecture

```
Walmart Storefront (canonical)
  ↕ served by
Node/Express Server
  ↕ consumes
Admin Console Database

Admin Console Panel
  ↕ served by
Node/Express Server
```

### Usage direction

- Keep storefront pages, templates, and cartridge code inside `walmart/`.
- Treat `walmart/` as the canonical storefront implementation.
- Build internal admin functionality inside `admin-console/` (source of truth for admin UI files).
- Use `server/` as the integration host for Walmart storefront routes, admin routes, and APIs.
- Admin backend/database source lives under `admin-console/node-express-backend` and `admin-console/database`.
- Follow `salesforce commerce cloud/RUNNING_INSTRUCTIONS.md` for local startup instructions.
