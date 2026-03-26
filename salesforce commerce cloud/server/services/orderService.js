const { readJsonFile } = require('../utils/fileStore');

const ORDERS_FILE = 'orders.json';
const livePaymentOrders = [];

// Return all orders from shared data plus live payment orders created in runtime.
async function getAllOrders() {
  const persisted = await readJsonFile(ORDERS_FILE);
  return [...persisted, ...livePaymentOrders];
}

async function getOrdersByCustomerId(customerId) {
  const orders = await getAllOrders();
  return orders.filter((order) => String(order.customerId || '') === String(customerId || ''));
}

function createPaymentOrder({ customerId, amount, currency, items, status, paymentStatus }) {
  const order = {
    id: `ord_live_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    customerId,
    total: amount,
    currency,
    items: items || [],
    status: status || 'pending',
    paymentStatus: paymentStatus || 'pending',
    paymentIntentId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  livePaymentOrders.push(order);
  return order;
}

function linkOrderPaymentIntent(orderId, paymentIntentId) {
  const order = livePaymentOrders.find((item) => item.id === orderId);
  if (!order) return null;
  order.paymentIntentId = paymentIntentId;
  order.updatedAt = new Date().toISOString();
  return order;
}

function updateOrderByPaymentIntent(paymentIntentId, paymentStatus) {
  const order = livePaymentOrders.find((item) => item.paymentIntentId === paymentIntentId);
  if (!order) return null;
  order.paymentStatus = paymentStatus;
  order.status = paymentStatus === 'paid' ? 'paid' : paymentStatus;
  order.updatedAt = new Date().toISOString();
  return order;
}

function updateOrderPaymentStatus(orderId, paymentStatus) {
  const order = livePaymentOrders.find((item) => item.id === orderId);
  if (!order) return null;
  order.paymentStatus = paymentStatus;
  order.status = paymentStatus === 'paid' ? 'paid' : paymentStatus;
  order.updatedAt = new Date().toISOString();
  return order;
}

module.exports = {
  getAllOrders,
  getOrdersByCustomerId,
  createPaymentOrder,
  linkOrderPaymentIntent,
  updateOrderByPaymentIntent,
  updateOrderPaymentStatus,
};
