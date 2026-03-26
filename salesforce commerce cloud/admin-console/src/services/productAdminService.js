const { apiClient } = require('./apiClient');

function createProduct(payload) { return apiClient('/api/admin/products/create', { method: 'POST', body: JSON.stringify(payload) }); }
function updateProduct(payload) { return apiClient('/api/admin/products/update', { method: 'POST', body: JSON.stringify(payload) }); }
function updatePrice(payload) { return apiClient('/api/admin/products/price', { method: 'POST', body: JSON.stringify(payload) }); }

module.exports = { createProduct, updateProduct, updatePrice };
