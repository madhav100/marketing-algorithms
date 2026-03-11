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
- `admin-console/` is a separate area for internal administration features.
- The backend and database layers can expose APIs/services consumed by the Admin Console Panel without changing storefront routing patterns.
