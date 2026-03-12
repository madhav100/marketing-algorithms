# Storefront (legacy simulation assets)

This folder contains older Express/Nunjucks simulation assets.

## Canonical storefront

The canonical storefront for this project is now:

- `../walmart/`

The local integration server (`../server`) is configured to render Walmart templates from:

- `../walmart/cartridge/templates/default`

and serve Walmart client assets at:

- `/client/*` → `../walmart/cartridge/client/*`

Use this folder only if you need to reference legacy simulation files.
