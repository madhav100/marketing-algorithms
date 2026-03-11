# Walmart SFRA Workflow

## Goal

Build the storefront **page by page**, not folder by folder.

The main idea is:

**request → controller → model → scripts/helpers → template → client assets**

This keeps the architecture clean and close to SFRA thinking.

---

## Build Order

Work in this order:

1. Home
2. Product
3. Cart
4. Checkout
5. Order confirmation
6. Account
7. Search / navigation
8. Experience / Page Designer support

For now, start with:

- `Home.js`
- `Product.js`
- `Cart.js`

---

## Core Rule

For every page, follow this order:

1. **Controller**
2. **Template**
3. **Model**
4. **Scripts / Helpers**
5. **Client JS**
6. **SCSS**
7. **Forms** if needed
8. **Experience** later

---

## Folder Roles

### `controllers/`
Handles the route and page entry.

Questions answered here:
- What request came in?
- What page should open?
- What data needs to be prepared?
- Which template should render?

Examples:
- `Home.js`
- `Product.js`
- `Cart.js`

---

### `models/`
Shapes data for the page.

Questions answered here:
- What data does the template need?
- How should raw product/cart/account data be cleaned and structured?

Examples:
- product title
- price
- stock
- cart totals
- customer info

---

### `scripts/helpers/`
Reusable backend logic.

Questions answered here:
- What logic will be reused?
- What should not stay inside controllers?

Examples:
- price formatting
- stock lookup
- cart total calculation
- validation helpers

---

### `scripts/middleware/`
Reusable request-processing logic.

Examples:
- request guards
- validation steps
- common route checks

---

### `scripts/util/`
Low-level shared utilities.

Examples:
- string formatting
- ID parsing
- common utility methods

---

### `templates/default/`
Display layer.

Questions answered here:
- What should the browser show?
- What sections should appear on the page?

This is the visual page structure.

Main areas:
- `home/`
- `product/`
- `cart/`
- `account/`

---

### `client/js/`
Browser-side interaction layer.

Examples:
- quantity change
- add-to-cart interaction
- mini-cart behavior
- image switching
- simple UI actions

---

### `client/scss/`
Styling layer.

Examples:
- layout
- product cards
- buttons
- forms
- cart styles
- page spacing

---

### `forms/`
Structured form definitions.

Examples:
- contact form
- checkout form
- login form

---

### `experience/`
Page Designer structure.

Examples:
- reusable page components
- page type definitions

This is not the first priority.

---

## Working Method Per Page

For each page, use this sequence:

### Step 1 — Define the page purpose
Ask:
- What does this page do?
- What should the user see?
- What actions should the user take?

---

### Step 2 — Create the controller
Start with the route entry.

Example:
- `Home.js` for homepage
- `Product.js` for product page
- `Cart.js` for cart page

The controller should:
- accept the request
- prepare the page flow
- call any needed model/helper logic
- render the correct template

---

### Step 3 — Create the template
Build the visible structure of the page.

Focus on:
- layout
- sections
- placeholders
- buttons
- content blocks

At this stage, think in HTML structure.

---

### Step 4 — Create the model
Only add a model when the page needs structured data.

Use models to prepare:
- product information
- account information
- cart summaries
- reusable view data

Keep templates simple by moving data shaping here.

---

### Step 5 — Move reusable logic into scripts
If logic appears more than once, move it into:
- `helpers/`
- `middleware/`
- `util/`

Controllers should stay light.

---

### Step 6 — Add client-side interaction
Only after the page structure works.

Use `client/js/` for:
- dynamic UI behavior
- browser events
- page interactions

---

### Step 7 — Add SCSS
Style after structure and logic are clear.

Use `client/scss/` for:
- spacing
- layout
- colors
- buttons
- component styling

---

## Recommended First Flow

### 1. Home Flow

Start with:

- `controllers/Home.js`
- `templates/default/home/`

Optional later:
- homepage model
- homepage client JS
- homepage SCSS

Goal:
Build a homepage shell with key sections.

Suggested homepage sections:
- hero
- featured categories
- featured products
- promotion banner

---

### 2. Product Flow

Then build:

- `controllers/Product.js`
- `models/product/`
- `scripts/helpers/` for product helpers
- `templates/default/product/`
- `client/js/` for product interactions
- `client/scss/` for product styling

Goal:
Build the product detail page.

Suggested product page sections:
- product title
- image
- price
- stock
- variant selector
- add to cart button
- product description

---

### 3. Cart Flow

Then build:

- `controllers/Cart.js`
- cart helper/model logic
- `templates/default/cart/`
- `client/js/` for quantity/remove actions
- `client/scss/` for cart layout

Goal:
Build the cart experience.

Suggested cart sections:
- list of items
- quantity update
- remove item
- subtotal
- checkout button

---

## Workflow Per Feature

For every feature, ask these questions in order:

### 1. What request comes in?
Use:
- `controllers/`

### 2. What data does the page need?
Use:
- `models/`

### 3. What logic should be reused?
Use:
- `scripts/helpers/`
- `scripts/middleware/`
- `scripts/util/`

### 4. What should the page display?
Use:
- `templates/default/`

### 5. What should the browser do interactively?
Use:
- `client/js/`

### 6. How should it look?
Use:
- `client/scss/`

---

## Simple File Start Order

### First
- `controllers/Home.js`

### Second
- homepage template files

### Third
- `controllers/Product.js`

### Fourth
- product model files
- product template files

### Fifth
- `controllers/Cart.js`

### Sixth
- cart helper/model/template files

---

## What Not To Do

Do not start by randomly filling all folders.

Do not do:
- all controllers first
- all models first
- all templates first

Instead, do:
- one page flow at a time

Bad approach:
- touch 20 files with no working flow

Good approach:
- finish one working page flow, then move to the next

---

## Clean Development Principle

Think like this:

**Today I am building the homepage flow.**  
Not: **Today I am working on controllers.**

**Today I am building the product flow.**  
Not: **Today I am working on models.**

**Today I am building the cart flow.**  
Not: **Today I am working on scripts.**

---

## Minimum Working Commerce Flow

Your first working commerce sequence should be:

1. Home
2. Product
3. Cart

After that, extend into:

4. Checkout
5. Order confirmation
6. Account
7. Search / navigation

---

## Final Summary

### Start with:
- `Home.js`

### Then build:
- homepage template

### Then move to:
- `Product.js`
- product template
- product model

### Then move to:
- `Cart.js`
- cart template
- cart helper/model logic

### Main rule:
Build **flow by flow**, not **folder by folder**.

### Core architecture:
**controller → model → helper/scripts → template → client JS/CSS**

---

## Networking Workflow (Later Phase)

### Goal

Simulate a local SFCC Business Manager networking model so admin, storefront, and support tools share one commerce data source.

Core path:

**Merchant/Admin → Admin Server → Shared Commerce Data → Storefront Server / Support Ops → Templates/UI → Shopper**

---

## Networking Components

### 1. Merchant / Admin Console
A local admin UI used by business users.

Main use:
- manage products
- manage categories
- manage inventory
- manage promotions
- manage orders and customers

---

### 2. Admin Server
Server-side module layer for business operations.

Main modules:
- Products Module
- Categories Module
- Inventory Module
- Promotions Module
- Orders Module
- Customers Module
- Content / Pages Module
- Settings Module

Role:
- receives admin actions
- validates requests
- reads/writes shared commerce data

---

### 3. Shared Commerce Data
Central commerce storage used by all systems.

Main data domains:
- products
- categories
- inventory
- price_books
- promotions
- customers
- carts
- orders
- content_blocks
- pages
- settings

Role:
- single source of truth for admin and storefront flows

---

### 4. Storefront Server (SFRA-like)
Customer-facing backend that reads shared commerce data.

Typical controllers:
- Home Controller
- Product Controller
- Cart Controller
- Checkout Controller
- Order Controller

Role:
- build storefront page responses
- pass data to templates

---

### 5. Support / Ops Panel
Optional internal tool UI.

Common actions:
- order lookup
- customer lookup
- refund / return tools
- inventory checks
- manual adjustments

Role:
- read operations data
- assist customer support teams

---

### 6. Templates / Frontend UI
Render layer shown to shoppers.

Main pages:
- Home Page
- Product Page
- Cart Page
- Checkout Page
- Order Confirmation
- Account Page

Role:
- render server data into shopper-facing pages

---

## Networking Request Flow

1. Admin user updates commerce data in local business console.
2. Admin server validates and writes updates to shared commerce data.
3. Storefront server reads latest data during shopper requests.
4. Templates render updated content for browser output.
5. Support/Ops panel can read the same source for service operations.

---

## Local Simulation Rule

When implementing this later:
- keep **admin routes** separate from storefront routes
- keep one shared data contract for both admin and storefront
- keep support tools read-focused by default
- keep storefront flow unchanged: **controller → model → helper/scripts → template → client JS/CSS**

