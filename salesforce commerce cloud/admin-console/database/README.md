# Database

This folder contains a lightweight file-based database implementation for the Admin Console backend.

## Structure

- `fileDatabase.js`: shared read/write helpers.
- `data/`: JSON collections used by the admin backend.
  - `products.json`
  - `categories.json`
  - `orders.json`

## Notes

- This setup is intended for local development and architecture simulation.
- The backend (`../node-express-backend`) treats these files as its persistence layer.
- If a collection file is missing, `fileDatabase.js` automatically creates it.
