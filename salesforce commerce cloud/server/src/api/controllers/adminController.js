const { requireAdmin } = require('../../middleware/auth');

function createAdminController(repo, publishEvent, exportOperationalRecord, dataCloudDbSyncConsumer) {
  return {
    createProduct(req) {
      if (!requireAdmin(req)) return { error: 'forbidden' };
      const product = repo.upsertProduct(req.body);
      publishEvent('admin.events', 'product_created', req.body);
      exportOperationalRecord(dataCloudDbSyncConsumer, 'products', product);
      return { product };
    },

    updateProduct(req) {
      if (!requireAdmin(req)) return { error: 'forbidden' };
      const product = repo.upsertProduct(req.body);
      publishEvent('product.events', 'product_updated', req.body);
      exportOperationalRecord(dataCloudDbSyncConsumer, 'products', product);
      return { product };
    },

    updatePrice(req) {
      if (!requireAdmin(req)) return { error: 'forbidden' };
      const product = repo.upsertProduct(req.body);
      publishEvent('product.events', 'price_updated', req.body);
      exportOperationalRecord(dataCloudDbSyncConsumer, 'products', product);
      return { product };
    },

    updateInventory(req) {
      if (!requireAdmin(req)) return { error: 'forbidden' };
      const product = repo.upsertProduct(req.body);
      publishEvent('product.events', 'inventory_updated', req.body);
      exportOperationalRecord(dataCloudDbSyncConsumer, 'products', product);
      return { product };
    },

    getOrders(req) {
      if (!requireAdmin(req)) return { error: 'forbidden' };
      return { orders: repo.getOrders() };
    },

    updateCustomer(req) {
      if (!requireAdmin(req)) return { error: 'forbidden' };
      const customer = repo.upsertCustomer(req.body);
      publishEvent('customer.events', 'customer_updated', req.body);
      exportOperationalRecord(dataCloudDbSyncConsumer, 'customers', customer);
      return { customer };
    },
  };
}

module.exports = { createAdminController };
