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
  if (req.path === '/' || req.path === '/walmart') return 'walmart:home';
  if (req.path.startsWith('/product/')) return 'walmart:product';
  if (req.path === '/cart') return 'walmart:cart';
  if (req.path === '/checkout') return 'walmart:checkout';
  if (req.path === '/account') return 'walmart:account';
  if (req.path === '/my-orders') return 'walmart:my-orders';
  if (req.path.startsWith('/admin')) return 'admin-console:ui';
  if (req.path.startsWith('/api/products')) return 'server-api:products';
  if (req.path.startsWith('/api/categories')) return 'server-api:categories';
  if (req.path.startsWith('/api/orders')) return 'server-api:orders';
  if (req.path.startsWith('/api/customers')) return 'server-api:customers';
  if (req.path.startsWith('/api/admin')) return 'server-api:admin';
  if (req.path.startsWith('/webhooks/stripe')) return 'server-api:stripe-webhook';
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
  const target = resolveRuntimeTarget(req);
  if (!target) return next();

  const source = `browser:${req.method} ${req.path}`;
  res.on('finish', () => {
    logRuntimeEdge(source, target, 1, { status: res.statusCode });
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
