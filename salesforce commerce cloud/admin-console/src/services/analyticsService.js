const { apiClient } = require('./apiClient');

// Guard: Admin console reads only governed outputs, never raw Data Cloud tables/endpoints.
function getProductPerformance() { return apiClient('/api/governed/products/performance'); }
function getCustomerSegments() { return apiClient('/api/governed/customers/segments'); }
function getDashboardSummary() { return apiClient('/api/governed/dashboard/summary'); }

module.exports = { getProductPerformance, getCustomerSegments, getDashboardSummary };
