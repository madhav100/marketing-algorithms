const { apiClient } = require('./apiClient');

function addToCart(payload) { return apiClient('/api/storefront/cart/add', { method: 'POST', body: JSON.stringify(payload) }); }
function removeFromCart(payload) { return apiClient('/api/storefront/cart/remove', { method: 'POST', body: JSON.stringify(payload) }); }

module.exports = { addToCart, removeFromCart };
