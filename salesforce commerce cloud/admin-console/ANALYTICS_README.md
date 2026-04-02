# Admin Console Analytics Runbook

This guide explains how to validate analytics in the Admin Console Dashboard and how to simulate events live.

---

## 1) Customer analytics (signed-in customers only)

Customer analytics cards are shown in **Dashboard → Customer Analytics (Signed-in only)**.

### Metrics included
- Sessions
- Unique Visitors/Customers
- Product Views
- Add to Cart
- Cart Abandonments
- Checkout Starts
- Completed Purchases
- Repeat Purchase Rate
- Avg Session (min)
- Avg Logged-in (min)
- Login Events
- Logout Events
- Cart → Checkout Rate
- Checkout → Purchase Rate

### How to simulate live
1. Sign in from storefront (must be authenticated; guest actions are intentionally ignored).
2. Browse categories and click products.
3. Add products to cart.
4. Go to checkout and submit payment (mock or Stripe flow).
5. Return to admin dashboard and refresh.

### Tracking sources in code
- Session lifecycle: `walmart/cartridge/client/default/js/analytics/sessionTracker.js`
- Product views: `walmart/cartridge/client/default/js/analytics/productTracker.js`
- Category clicks: `walmart/cartridge/client/default/js/analytics/categoryTracker.js`
- Cart adds: `walmart/cartridge/client/default/js/analytics/cartTracker.js`
- Checkout + purchase complete: `walmart/cartridge/client/default/js/checkout/stripeCheckout.js`

---

## 2) Producer (market) analytics

Producer analytics cards are shown in **Dashboard → Producer (Market) Analytics**.

### Metrics included
- Total Revenue
- Total Orders
- Average Order Value
- Units Sold
- Low Stock Count
- Out of Stock Count
- Return Count
- Return Rate
- Active Products
- Retired Products
- Inventory Turnover
- Sell-through Rate
- Revenue / Visitor

### How to simulate live
1. Complete purchases in storefront checkout as signed-in users.
2. Modify product inventory/status in Admin Console (Storefront/Inventory sections).
3. Reopen dashboard and refresh to view updated producer metrics.

### Data sources in code
- Orders + products aggregation: `server/services/analyticsService.js` (`getBusinessMetrics`)
- Dashboard API: `GET /admin/api/analytics/business-metrics`

---

## 3) Important combinations (admin insights)

The dashboard insight lists are:
- Urgent restocks
- Failing products
- Friction products
- Dead inventory

If strict conditions produce no rows in a low-volume environment, fallback candidates are shown so admins always have a review list.

---

## 4) CSV exports for Data Console

Dashboard buttons:
- **Export Customer CSV**
- **Export Producer CSV**
- **Export Combined CSV**

### API
- `POST /admin/api/analytics/export-csv`
  - body type: `customer`, `producer`, `combined_insights`, or `all`

### Storage location
- `admin-console/database/data-console-exports/`

Generated files are timestamped and can be ingested by downstream data-console tooling.
