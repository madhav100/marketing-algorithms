const crypto = require('node:crypto');

const STRIPE_API = 'https://api.stripe.com/v1';

function getPublishableKey() {
  return process.env.STRIPE_PUBLISHABLE_KEY || '';
}

function toStripeAmount(amount) {
  return Math.round(Number(amount || 0) * 100);
}

async function createPaymentIntent({ amount, currency = 'usd', metadata = {} }) {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return {
      provider: 'stripe',
      mode: 'mock',
      id: `pi_mock_${Date.now()}`,
      clientSecret: `pi_mock_secret_${Date.now()}`,
      amount,
      currency,
      status: 'requires_payment_method',
    };
  }

  const body = new URLSearchParams();
  body.set('amount', String(toStripeAmount(amount)));
  body.set('currency', currency);
  body.set('automatic_payment_methods[enabled]', 'true');

  Object.entries(metadata).forEach(([key, value]) => {
    body.set(`metadata[${key}]`, String(value));
  });

  const response = await fetch(`${STRIPE_API}/payment_intents`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Stripe PaymentIntent creation failed');
  }

  return {
    provider: 'stripe',
    mode: 'test',
    id: payload.id,
    clientSecret: payload.client_secret,
    amount,
    currency,
    status: payload.status,
  };
}

function verifyStripeWebhook(rawBody, stripeSignature) {
  const signingSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signingSecret) {
    return { verified: true, reason: 'no_webhook_secret_configured' };
  }

  if (!stripeSignature) {
    throw new Error('Missing Stripe-Signature header');
  }

  const parts = Object.fromEntries(
    stripeSignature.split(',').map((part) => {
      const [k, v] = part.split('=');
      return [k, v];
    }),
  );

  const signedPayload = `${parts.t}.${rawBody.toString('utf8')}`;
  const expected = crypto.createHmac('sha256', signingSecret).update(signedPayload).digest('hex');

  if (expected !== parts.v1) {
    throw new Error('Invalid Stripe webhook signature');
  }

  return { verified: true };
}

module.exports = {
  getPublishableKey,
  createPaymentIntent,
  verifyStripeWebhook,
};
