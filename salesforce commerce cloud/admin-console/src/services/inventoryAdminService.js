const { apiClient } = require('./apiClient');

function updateInventory(payload) { return apiClient('/api/admin/products/inventory', { method: 'POST', body: JSON.stringify(payload) }); }

module.exports = { updateInventory };
