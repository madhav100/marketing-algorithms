const { readJsonFile, writeJsonFile } = require('../utils/fileStore');

const ORDERS_FILE = 'orders.json';

async function getAllOrders() {
  return readJsonFile(ORDERS_FILE);
}

async function getOrdersByCustomerId(customerId) {
  const orders = await getAllOrders();
  return orders.filter((order) => String(order.customerId || '') === String(customerId || ''));
}

async function createPaymentOrder({ customerId, amount, currency, items, status, paymentStatus }) {
  const orders = await getAllOrders();
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

  orders.push(order);
  await writeJsonFile(ORDERS_FILE, orders);
  return order;
}

async function linkOrderPaymentIntent(orderId, paymentIntentId) {
  const orders = await getAllOrders();
  const order = orders.find((item) => item.id === orderId);
  if (!order) return null;
  order.paymentIntentId = paymentIntentId;
  order.updatedAt = new Date().toISOString();
  await writeJsonFile(ORDERS_FILE, orders);
  return order;
}

async function updateOrderByPaymentIntent(paymentIntentId, paymentStatus) {
  const orders = await getAllOrders();
  const order = orders.find((item) => item.paymentIntentId === paymentIntentId);
  if (!order) return null;
  order.paymentStatus = paymentStatus;
  order.status = paymentStatus === 'paid' ? 'paid' : paymentStatus;
  order.updatedAt = new Date().toISOString();
  await writeJsonFile(ORDERS_FILE, orders);
  return order;
}

async function updateOrderPaymentStatus(orderId, paymentStatus) {
  const orders = await getAllOrders();
  const order = orders.find((item) => item.id === orderId);
  if (!order) return null;
  order.paymentStatus = paymentStatus;
  order.status = paymentStatus === 'paid' ? 'paid' : paymentStatus;
  order.updatedAt = new Date().toISOString();
  await writeJsonFile(ORDERS_FILE, orders);
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
