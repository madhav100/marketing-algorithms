# Running Instructions

This guide links the full flow between Walmart storefront, server, and admin-console.

## 1) Install dependencies

From `salesforce commerce cloud/`:

```bash
npm install
```

## 2) Start the integration server (recommended)

```bash
npm start
```

Server defaults to `http://localhost:3000`.

### Primary routes

- Walmart homepage (canonical storefront):
  - `http://localhost:3000/`
  - `http://localhost:3000/walmart`
- Walmart product page:
  - `http://localhost:3000/product/p1001`
- Walmart cart page:
  - `http://localhost:3000/cart`
- Admin Console UI:
  - `http://localhost:3000/admin`
- Shared APIs:
  - `http://localhost:3000/api/products`
  - `http://localhost:3000/api/categories`
  - `http://localhost:3000/api/orders`

## 3) Optional: start admin backend standalone

If you want to run the dedicated admin-console backend directly:

```bash
npm run start:admin-backend
```

This starts `admin-console/node-express-backend/src/server.js` on port `4000` by default.

### Standalone admin backend routes

- `http://localhost:4000/admin`
- `http://localhost:4000/api/admin/health`
- `http://localhost:4000/api/admin/products`
- `http://localhost:4000/api/admin/categories`
- `http://localhost:4000/api/admin/orders`

## Data flow / linkage summary

- Walmart storefront templates and assets live in `walmart/`.
- Integration hosting and shared APIs live in `server/`.
- Admin UI lives in `admin-console/admin-console-panel/`.
- Admin persistence lives in `admin-console/database/data/`.
- `server/utils/fileStore.js` points to the admin-console database path so admin/API data stays aligned.
