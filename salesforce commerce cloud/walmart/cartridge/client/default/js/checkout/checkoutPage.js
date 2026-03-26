(function () {
  function getCurrentCustomer() {
    try {
      return JSON.parse(window.localStorage.getItem('wmCurrentCustomer') || 'null');
    } catch (error) {
      return null;
    }
  }

  function getCartItems() {
    try {
      const customer = getCurrentCustomer();
      const key = 'wmCartItems::' + (customer && customer.id ? customer.id : 'guest');
      return JSON.parse(window.localStorage.getItem(key) || '[]');
    } catch (error) {
      return [];
    }
  }

  function calculateAmount(items) {
    return items.reduce(function (sum, item) {
      return sum + (Number(item.price || 0) * Number(item.quantity || 0));
    }, 0);
  }

  document.addEventListener('DOMContentLoaded', function () {
    const items = getCartItems();
    const amount = calculateAmount(items);
    const customer = getCurrentCustomer();
    const publishableKey = document.body.dataset.stripePublishableKey || '';

    if (typeof window.initializeStripeCheckout !== 'function') {
      return;
    }

    window.initializeStripeCheckout({
      publishableKey,
      checkoutPayload: {
        amount,
        currency: 'usd',
        items,
        customerId: customer && customer.id ? customer.id : 'guest',
      },
    });
  });
})();
