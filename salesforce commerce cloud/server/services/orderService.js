const { readJsonFile } = require('../utils/fileStore');

const ORDERS_FILE = 'orders.json';

// Return all orders from shared data.
async function getAllOrders() {
  return readJsonFile(ORDERS_FILE);
}

module.exports = {
  getAllOrders,
};
