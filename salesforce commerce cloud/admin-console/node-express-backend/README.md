# Node/Express Backend

This folder contains the runnable Admin Console API/backend for local development.

## What it does

- Serves the admin UI panel from `../admin-console-panel` at `/admin`.
- Exposes admin API endpoints under `/api/admin`.
- Reads/writes product/category/order data using `../database/fileDatabase.js`.

## Entry point

- `src/server.js` starts the backend.
- `src/app.js` configures middleware, static hosting, and routes.

## API routes

- `GET /api/admin/health`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `PUT /api/admin/products/:id`
- `DELETE /api/admin/products/:id`
- `GET /api/admin/categories`
- `GET /api/admin/orders`
