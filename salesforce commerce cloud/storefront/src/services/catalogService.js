const { apiClient } = require('./apiClient');

function getProduct(id) { return apiClient(`/api/storefront/products/${id}`); }
function searchProducts(q) { return apiClient(`/api/storefront/search?q=${encodeURIComponent(q)}`); }

module.exports = { getProduct, searchProducts };
