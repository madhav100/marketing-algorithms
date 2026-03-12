# admin-console

This folder contains the Admin Console architecture that complements the existing `walmart` SFRA storefront.

## Architecture

Admin Console Panel  
↓  
Node/Express Backend  
↓  
Database

## Relationship to `walmart` (SFRA storefront)

- `walmart/` remains the storefront implementation (SFRA architecture).
- `admin-console/` is the source for internal administration UI features (including `admin-console-panel/admin.html`).
- `server/` should only host this admin UI and expose supporting APIs; avoid duplicating admin files elsewhere.
- `node-express-backend/` now contains a runnable Express API (`src/server.js`) for admin operations.
- `database/` contains the file-based persistence layer consumed by the admin backend.
- The backend and database layers can expose APIs/services consumed by the Admin Console Panel without changing storefront routing patterns.
