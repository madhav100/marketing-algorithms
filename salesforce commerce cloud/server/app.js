const express = require('express');
const path = require('path');
const nunjucks = require('nunjucks');

const storefrontRoutes = require('./routes/storefrontRoutes');
const adminRoutes = require('./routes/adminRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const productRoutes = require('./routes/api/products');
const categoryRoutes = require('./routes/api/categories');
const orderRoutes = require('./routes/api/orders');
const customerRoutes = require('./routes/api/customers');

const app = express();
const PORT = 3000;
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

// Parse JSON bodies for API requests.
app.use(express.json());

// Serve static assets for admin and Walmart storefront UIs.
app.use('/admin', express.static(path.join(__dirname, '../admin-console/admin-console-panel')));
app.use('/admin/customer-sessions', express.static(path.join(__dirname, '../admin-console/customer-sessions')));
app.use('/client', express.static(path.join(__dirname, '../walmart/cartridge/client')));

// Register application routes.
app.use('/admin', adminRoutes);
app.use('/', storefrontRoutes);
app.use('/', analyticsRoutes);
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
