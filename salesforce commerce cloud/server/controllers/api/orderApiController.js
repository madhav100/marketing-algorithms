const orderService = require('../../services/orderService');

// Handle GET /api/orders.
async function getOrders(req, res, next) {
  try {
    const orders = await orderService.getAllOrders();
    res.json(orders);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getOrders,
};
