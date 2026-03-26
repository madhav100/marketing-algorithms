const { apiClient } = require('./apiClient');

function startCheckout(payload) { return apiClient('/api/storefront/checkout/start', { method: 'POST', body: JSON.stringify(payload) }); }
function createOrder(payload) { return apiClient('/api/storefront/order/create', { method: 'POST', body: JSON.stringify(payload) }); }

module.exports = { startCheckout, createOrder };
