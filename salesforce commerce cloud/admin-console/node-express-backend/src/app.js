const express = require('express');
const path = require('path');

const adminApiRoutes = require('./routes/adminApiRoutes');
const { logRuntimeEdge } = require('../../../server/utils/runtimeEventLogger');

const app = express();


function resolveAdminRuntimeTarget(req) {
  if (req.path.startsWith('/admin')) {
    return { target: 'admin-console:ui', file: 'admin-console/admin-console-panel/admin.js', fn: 'adminPanelBootstrap' };
  }
  if (req.path.startsWith('/api/admin/health')) {
    return { target: 'admin-backend:health', file: 'admin-console/node-express-backend/src/routes/adminApiRoutes.js', fn: 'GET /health' };
  }
  if (req.path.startsWith('/api/admin/products')) {
    return { target: 'admin-backend:products', file: 'admin-console/node-express-backend/src/routes/adminApiRoutes.js', fn: 'products handlers' };
  }
  if (req.path.startsWith('/api/admin/categories')) {
    return { target: 'admin-backend:categories', file: 'admin-console/node-express-backend/src/routes/adminApiRoutes.js', fn: 'categories handlers' };
  }
  if (req.path.startsWith('/api/admin/orders')) {
    return { target: 'admin-backend:orders', file: 'admin-console/node-express-backend/src/routes/adminApiRoutes.js', fn: 'orders handlers' };
  }
  return null;
}

app.use(express.json());

app.use((req, res, next) => {
  const routeMeta = resolveAdminRuntimeTarget(req);
  if (!routeMeta) return next();

  const source = `browser:${req.method} ${req.path}`;
  res.on('finish', () => {
    logRuntimeEdge(source, routeMeta.target, 1, {
      status: res.statusCode,
      backend: 'admin-console',
      file: routeMeta.file,
      fn: routeMeta.fn,
      method: req.method,
      path: req.path,
    });
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
