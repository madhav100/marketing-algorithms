const paymentService = require('../services/paymentService');
const orderService = require('../services/orderService');

function validateCheckoutPayload(payload = {}) {
  const amount = Number(payload.amount || 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Invalid checkout amount');
  }
  return {
    amount,
    currency: payload.currency || 'usd',
    items: Array.isArray(payload.items) ? payload.items : [],
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
      status: 'pending',
      paymentStatus: 'pending',
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
