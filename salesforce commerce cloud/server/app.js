const express = require('express');
const path = require('path');
const nunjucks = require('nunjucks');
const { loadEnvLocal } = require('./utils/loadEnvLocal');
const { logRuntimeEdge } = require('./utils/runtimeEventLogger');

loadEnvLocal();

const storefrontRoutes = require('./routes/storefrontRoutes');
const adminRoutes = require('./routes/adminRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const WebhooksController = require('./controllers/Webhooks');
const productRoutes = require('./routes/api/products');
const categoryRoutes = require('./routes/api/categories');
const orderRoutes = require('./routes/api/orders');
const customerRoutes = require('./routes/api/customers');

const app = express();
const PORT = 3000;

function resolveRuntimeTarget(req) {
  if (req.path === '/' || req.path === '/walmart') {
    return { target: 'walmart:home', file: 'server/controllers/storefront/Home.js', fn: 'showHome' };
  }
  if (req.path.startsWith('/product/')) {
    return { target: 'walmart:product', file: 'server/controllers/storefront/Product.js', fn: 'showProduct' };
  }
  if (req.path === '/cart') {
    return { target: 'walmart:cart', file: 'server/controllers/storefront/Cart.js', fn: 'showCart' };
  }
  if (req.path === '/checkout') {
    return { target: 'walmart:checkout', file: 'server/controllers/storefront/Checkout.js', fn: 'showCheckout' };
  }
  if (req.path === '/account') {
    return { target: 'walmart:account', file: 'server/controllers/storefront/Account.js', fn: 'showAccount' };
  }
  if (req.path === '/my-orders') {
    return { target: 'walmart:my-orders', file: 'server/controllers/storefront/MyOrders.js', fn: 'showMyOrders' };
  }
  if (req.path.startsWith('/admin')) {
    return { target: 'admin-console:ui', file: 'server/routes/adminRoutes.js', fn: 'router.get(/)' };
  }
  if (req.path.startsWith('/api/products')) {
    return { target: 'server-api:products', file: 'server/routes/api/products.js', fn: 'productRoutes' };
  }
  if (req.path.startsWith('/api/categories')) {
    return { target: 'server-api:categories', file: 'server/routes/api/categories.js', fn: 'categoryRoutes' };
  }
  if (req.path.startsWith('/api/orders')) {
    return { target: 'server-api:orders', file: 'server/routes/api/orders.js', fn: 'orderRoutes' };
  }
  if (req.path.startsWith('/api/customers')) {
    return { target: 'server-api:customers', file: 'server/routes/api/customers.js', fn: 'customerRoutes' };
  }
  if (req.path.startsWith('/api/admin')) {
    return { target: 'server-api:admin', file: 'server/src/api/routes/adminRoutes.js', fn: 'adminRoutes' };
  }
  if (req.path.startsWith('/webhooks/stripe')) {
    return { target: 'server-api:stripe-webhook', file: 'server/controllers/Webhooks.js', fn: 'handleStripeWebhook' };
  }
  return null;
}

const SERVER_BOOT_ID = String(Date.now());

// Configure Nunjucks to render canonical Walmart storefront templates.
nunjucks.configure(path.join(__dirname, '../walmart/cartridge/templates/default'), {
  autoescape: true,
  express: app,
  noCache: true,
});
app.set('view engine', 'html');
app.locals.serverBootId = SERVER_BOOT_ID;

app.use((req, res, next) => {
  res.locals.serverBootId = req.app.locals.serverBootId;
  next();
});

// Stripe webhook must receive raw body for signature verification.
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), WebhooksController.handleStripeWebhook);

// Parse JSON bodies for API requests.
app.use(express.json());

// Capture live request edges for the runtime flow visualizer.
app.use((req, res, next) => {
  const routeMeta = resolveRuntimeTarget(req);
  if (!routeMeta) return next();

  const source = `browser:${req.method} ${req.path}`;
  res.on('finish', () => {
    logRuntimeEdge(source, routeMeta.target, 1, {
      status: res.statusCode,
      file: routeMeta.file,
      fn: routeMeta.fn,
      method: req.method,
      path: req.path,
    });
  });
  next();
});

// Serve static assets for admin and Walmart storefront UIs.
app.use('/admin', express.static(path.join(__dirname, '../admin-console/admin-console-panel')));
app.use('/admin/customer-sessions', express.static(path.join(__dirname, '../admin-console/customer-sessions')));
app.use('/client', express.static(path.join(__dirname, '../walmart/cartridge/client')));

// Register application routes.
app.use('/admin', adminRoutes);
app.use('/', storefrontRoutes);
app.use('/', analyticsRoutes);
app.use('/', paymentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);

// Basic error handler for local debugging.
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Local SFRA server running at http://localhost:${PORT}`);
});
