const { apiClient } = require('./apiClient');

function updateAccount(payload) {
  // Account edits are routed through server-owned admin/customer APIs.
  return apiClient('/api/admin/customers/update', { method: 'POST', body: JSON.stringify(payload) });
}

module.exports = { updateAccount };
