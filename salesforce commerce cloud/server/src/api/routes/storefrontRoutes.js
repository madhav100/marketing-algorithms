function createStorefrontRoutes(controller) {
  return {
    'GET /api/storefront/products/:id': controller.getProduct,
    'GET /api/storefront/search': controller.search,
    'POST /api/storefront/cart/add': controller.addToCart,
    'POST /api/storefront/cart/remove': controller.removeFromCart,
    'POST /api/storefront/checkout/start': controller.startCheckout,
    'POST /api/storefront/order/create': controller.createOrder,
  };
}

module.exports = { createStorefrontRoutes };
