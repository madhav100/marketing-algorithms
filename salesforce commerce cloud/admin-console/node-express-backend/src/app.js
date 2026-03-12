const express = require('express');
const path = require('path');

const adminApiRoutes = require('./routes/adminApiRoutes');

const app = express();

app.use(express.json());

app.use('/admin', express.static(path.join(__dirname, '../../admin-console-panel')));
app.use('/api/admin', adminApiRoutes);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'Admin backend internal server error' });
});

module.exports = app;
