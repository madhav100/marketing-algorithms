const { apiClient } = require('./apiClient');

function getOrders() { return apiClient('/api/admin/orders'); }

module.exports = { getOrders };
