const express = require('express');
const path = require('path');
const nunjucks = require('nunjucks');

const storefrontRoutes = require('./routes/storefrontRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/api/products');
const categoryRoutes = require('./routes/api/categories');
const orderRoutes = require('./routes/api/orders');

const app = express();
const PORT = 3000;

// Configure Nunjucks to render .njk templates from storefront views.
nunjucks.configure(path.join(__dirname, '../storefront/views'), {
  autoescape: true,
  express: app,
  noCache: true,
});
app.set('view engine', 'njk');

// Parse JSON bodies for API requests.
app.use(express.json());

// Serve static assets for admin and storefront UIs.
app.use(express.static(path.join(__dirname, '../console')));
app.use('/storefront', express.static(path.join(__dirname, '../storefront/public')));

// Register application routes.
app.use('/admin', adminRoutes);
app.use('/', storefrontRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);

// Basic error handler for local debugging.
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Local SFRA server running at http://localhost:${PORT}`);
});
