# marketing-algorithms

## SFCC project structure

This repository includes a Salesforce Commerce Cloud setup with:

- A storefront implementation in SFRA style (`salesforce commerce cloud/walmart`).
- A separate Admin Console architecture skeleton (`salesforce commerce cloud/admin-console`).

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
- Build internal admin functionality inside `admin-console/`.
- Connect the two through backend APIs/services as needed.
