const { readJsonFile } = require('../utils/fileStore');

const ORDERS_FILE = 'orders.json';

// Return all orders from shared data.
async function getAllOrders() {
  return readJsonFile(ORDERS_FILE);
}

async function getOrdersByCustomerId(customerId) {
  const orders = await getAllOrders();
  return orders.filter((order) => String(order.customerId || '') === String(customerId || ''));
}

module.exports = {
  getAllOrders,
  getOrdersByCustomerId,
};
