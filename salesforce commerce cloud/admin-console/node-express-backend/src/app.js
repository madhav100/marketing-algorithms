const express = require('express');
const path = require('path');

const adminApiRoutes = require('./routes/adminApiRoutes');
const { logRuntimeEdge } = require('../../../server/utils/runtimeEventLogger');

const app = express();


function resolveAdminRuntimeTarget(req) {
  if (req.path.startsWith('/admin')) return 'admin-console:ui';
  if (req.path.startsWith('/api/admin/health')) return 'admin-backend:health';
  if (req.path.startsWith('/api/admin/products')) return 'admin-backend:products';
  if (req.path.startsWith('/api/admin/categories')) return 'admin-backend:categories';
  if (req.path.startsWith('/api/admin/orders')) return 'admin-backend:orders';
  return null;
}

app.use(express.json());

app.use((req, res, next) => {
  const target = resolveAdminRuntimeTarget(req);
  if (!target) return next();

  const source = `browser:${req.method} ${req.path}`;
  res.on('finish', () => {
    logRuntimeEdge(source, target, 1, { status: res.statusCode, backend: 'admin-console' });
  });
  next();
});

app.use('/admin', express.static(path.join(__dirname, '../../admin-console-panel')));
app.use('/api/admin', adminApiRoutes);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'Admin backend internal server error' });
});

module.exports = app;
