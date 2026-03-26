const { apiClient } = require('./apiClient');

function updateCustomer(payload) { return apiClient('/api/admin/customers/update', { method: 'POST', body: JSON.stringify(payload) }); }

module.exports = { updateCustomer };
