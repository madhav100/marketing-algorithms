function createAdminRoutes(controller) {
  return {
    'POST /api/admin/products/create': controller.createProduct,
    'POST /api/admin/products/update': controller.updateProduct,
    'POST /api/admin/products/price': controller.updatePrice,
    'POST /api/admin/products/inventory': controller.updateInventory,
    'GET /api/admin/orders': controller.getOrders,
    'POST /api/admin/customers/update': controller.updateCustomer,
  };
}

module.exports = { createAdminRoutes };
