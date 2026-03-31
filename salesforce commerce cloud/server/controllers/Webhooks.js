const paymentService = require('../services/paymentService');
const orderService = require('../services/orderService');

function mapPaymentStatus(eventType) {
  if (eventType === 'payment_intent.succeeded') return 'paid';
  if (eventType === 'payment_intent.payment_failed') return 'failed';
  if (eventType === 'payment_intent.processing') return 'processing';
  if (eventType === 'charge.refunded') return 'refunded';
  return 'pending_payment';
}

async function handleStripeWebhook(req, res) {
  try {
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body || {}));
    paymentService.verifyStripeWebhook(rawBody, req.headers['stripe-signature']);

    const event = JSON.parse(rawBody.toString('utf8'));
    const paymentIntentId = event?.data?.object?.id;

    if (paymentIntentId) {
      const paymentStatus = mapPaymentStatus(event.type);
      await orderService.updateOrderByPaymentIntent(paymentIntentId, paymentStatus);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

module.exports = {
  handleStripeWebhook,
};
