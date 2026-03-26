const paymentService = require('../services/paymentService');
const orderService = require('../services/orderService');

function computeAmountFromItems(items) {
  return items.reduce((sum, item) => {
    const price = Number(item.price || 0);
    const quantity = Number(item.quantity || 0);
    return sum + (price * quantity);
  }, 0);
}

function validateCheckoutPayload(payload = {}) {
  const items = Array.isArray(payload.items) ? payload.items : [];
  if (!items.length) {
    throw new Error('Cart is empty.');
  }

  const serverAmount = Number(computeAmountFromItems(items).toFixed(2));
  if (!Number.isFinite(serverAmount) || serverAmount <= 0) {
    throw new Error('Invalid checkout amount derived from cart items');
  }

  return {
    amount: serverAmount,
    currency: payload.currency || 'usd',
    items,
    customerId: payload.customerId || 'guest',
  };
}

async function createIntent(req, res) {
  try {
    const payload = validateCheckoutPayload(req.body || {});
    const order = orderService.createPaymentOrder({
      customerId: payload.customerId,
      amount: payload.amount,
      currency: payload.currency,
      items: payload.items,
      status: 'pending_payment',
      paymentStatus: 'pending_payment',
    });

    const intent = await paymentService.createPaymentIntent({
      amount: payload.amount,
      currency: payload.currency,
      metadata: { orderId: order.id, customerId: payload.customerId },
    });

    orderService.linkOrderPaymentIntent(order.id, intent.id);

    return res.status(200).json({
      publishableKey: paymentService.getPublishableKey(),
      clientSecret: intent.clientSecret,
      orderId: order.id,
      paymentIntentId: intent.id,
      mode: intent.mode,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

module.exports = {
  createIntent,
};
