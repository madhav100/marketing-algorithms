const { requireFields } = require('../../middleware/validation');

function createStorefrontController(repo, publishEvent) {
  return {
    getProduct({ params }) {
      return repo.getProductById(params.id);
    },

    search({ query }) {
      publishEvent('storefront.events', 'search', { query: query.q || '' });
      return { query: query.q || '', results: [] };
    },

    addToCart({ body }) {
      const validation = requireFields(body, ['customerId', 'productId', 'quantity']);
      if (!validation.valid) return { error: `Missing: ${validation.missing.join(', ')}` };

      const cart = repo.addToCart(body.customerId, { productId: body.productId, quantity: body.quantity });
      publishEvent('storefront.events', 'add_to_cart', body);
      return { cart };
    },

    removeFromCart({ body }) {
      const cart = repo.removeFromCart(body.customerId, body.productId);
      publishEvent('storefront.events', 'remove_from_cart', body);
      return { cart };
    },

    startCheckout({ body }) {
      // Danger zone guard: checkout must not depend on Data Cloud state.
      publishEvent('order.events', 'checkout_start', body);
      return { status: 'checkout_started', sourceOfTruth: 'operational-db' };
    },

    createOrder({ body }) {
      const order = repo.addOrder({ ...body, createdAt: new Date().toISOString() });
      publishEvent('order.events', 'order_created', body);
      return { order };
    },
  };
}

module.exports = { createStorefrontController };
