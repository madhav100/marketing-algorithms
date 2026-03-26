const test = require('node:test');
const assert = require('node:assert/strict');

const paymentService = require('../services/paymentService');
const orderService = require('../services/orderService');

test('createPaymentIntent returns mock intent when Stripe secret is not configured', async () => {
  const intent = await paymentService.createPaymentIntent({ amount: 10, currency: 'usd' });
  assert.equal(intent.provider, 'stripe');
  assert.equal(intent.mode, 'mock');
  assert.ok(intent.clientSecret.startsWith('pi_mock_secret_'));
});

test('order payment status updates from webhook mapping', () => {
  const order = orderService.createPaymentOrder({
    customerId: 'C1',
    amount: 30,
    currency: 'usd',
    items: [],
    status: 'pending',
    paymentStatus: 'pending',
  });

  orderService.linkOrderPaymentIntent(order.id, 'pi_test_123');
  const updated = orderService.updateOrderByPaymentIntent('pi_test_123', 'paid');

  assert.equal(updated.paymentStatus, 'paid');
  assert.equal(updated.status, 'paid');
});

test('order payment status can be updated directly by order id', () => {
  const order = orderService.createPaymentOrder({
    customerId: 'C2',
    amount: 45,
    currency: 'usd',
    items: [],
    status: 'pending_payment',
    paymentStatus: 'pending_payment',
  });

  const updated = orderService.updateOrderPaymentStatus(order.id, 'paid');
  assert.equal(updated.paymentStatus, 'paid');
  assert.equal(updated.status, 'paid');
});
