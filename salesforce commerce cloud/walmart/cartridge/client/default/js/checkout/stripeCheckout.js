async function initializeStripeCheckout({ publishableKey, checkoutPayload }) {
  const messageNode = document.getElementById('payment-message');
  const submitButton = document.getElementById('submit-payment');
  const paymentForm = document.getElementById('payment-form');
  let currentOrderId = '';

  function setMessage(message) {
    if (messageNode) messageNode.textContent = message;
  }

  const setupResponse = await fetch('/payments/create-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(checkoutPayload),
  });

  const setup = await setupResponse.json();
  if (!setupResponse.ok) {
    setMessage(setup.message || 'Unable to initialize payment.');
    return;
  }
  currentOrderId = setup.orderId || '';

  async function persistPaymentStatus(paymentStatus, paymentIntentId) {
    if (!currentOrderId) {
      return;
    }

    await fetch('/payments/confirm-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: currentOrderId,
        paymentIntentId: paymentIntentId || setup.paymentIntentId || '',
        paymentStatus,
      }),
    });
  }

  if (setup.mode === 'mock') {
    setMessage('Stripe keys are not configured yet. Configure test keys to render Payment Element.');
    paymentForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      submitButton.disabled = true;
      await persistPaymentStatus('paid', setup.paymentIntentId);
      setMessage('Mock payment succeeded. Add Stripe test keys for real Payment Element.');
      submitButton.disabled = false;
    });
    return;
  }

  if (!publishableKey || !setup.clientSecret || typeof window.Stripe !== 'function') {
    setMessage('Stripe test mode is not fully configured. Set publishable/secret keys to enable card form.');
    return;
  }

  const stripe = window.Stripe(publishableKey);
  const elements = stripe.elements({ clientSecret: setup.clientSecret });
  const paymentElement = elements.create('payment');
  paymentElement.mount('#payment-element');

  paymentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    submitButton.disabled = true;
    setMessage('Processing payment...');

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout?status=return`,
      },
      redirect: 'if_required',
    });

    if (result.error) {
      await persistPaymentStatus('failed', setup.paymentIntentId);
      setMessage(result.error.message || 'Payment failed.');
      submitButton.disabled = false;
      return;
    }

    if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
      await persistPaymentStatus('paid', result.paymentIntent.id);
      setMessage('Payment successful. Your order is now visible on My Orders.');
      submitButton.disabled = false;
      return;
    }

    await persistPaymentStatus('processing', result.paymentIntent && result.paymentIntent.id);
    setMessage('Payment submitted. Final status will update via webhook.');
    submitButton.disabled = false;
  });
}

window.initializeStripeCheckout = initializeStripeCheckout;
