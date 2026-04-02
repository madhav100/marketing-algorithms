const CORE_FLOW = [
  ['storefrontRoutes:/checkout', 'checkoutPage.js:initCheckout'],
  ['checkoutPage.js:initCheckout', 'stripeCheckout.js:initializeStripeCheckout'],
  ['stripeCheckout.js:initializeStripeCheckout', 'Payments.createIntent'],
  ['Payments.createIntent', 'orderService.createPaymentOrder'],
  ['Payments.createIntent', 'paymentService.createPaymentIntent'],
  ['stripeCheckout.js:initializeStripeCheckout', 'Payments.confirmIntent'],
  ['Payments.confirmIntent', 'orderService.updateOrderPaymentStatus'],
  ['storefrontRoutes:/my-orders', 'customerApiController.getCustomerOrders'],
  ['customerApiController.getCustomerOrders', 'orderService.getOrdersByCustomerId'],
  ['analyticsRoutes:/admin/api/analytics/business-metrics', 'AnalyticsController.getBusinessMetrics'],
  ['AnalyticsController.getBusinessMetrics', 'analyticsService.getBusinessMetrics'],
  ['analyticsService.getBusinessMetrics', 'fileStore.readJsonFile(orders.json)'],
  ['analyticsService.getBusinessMetrics', 'fileStore.readJsonFile(customers.json)'],
  ['accountPage.js:bindForms', 'customerApiController.signInCustomer'],
  ['customerApiController.signInCustomer', 'customerService.authenticateCustomer'],
  ['homePage.js:bindSignOut', 'sessionTracker.logout'],
  ['sessionTracker.logout', 'AnalyticsController.logLogout'],
  ['AnalyticsController.logLogout', 'analyticsService.logLogout'],
  ['analyticsService.logLogout', 'analyticsService.logEvent(cart_abandon?)'],
  ['customerApiController.deleteCustomer', 'customerService.deleteCustomer'],
  ['customerService.deleteCustomer', 'customerService.pruneCustomerOperationalData'],
  ['customerService.pruneCustomerOperationalData', 'fileStore.writeJsonFile(orders.json)'],
  ['customerService.pruneCustomerOperationalData', 'fileStore.writeJsonFile(analytics-sessions.json)'],
  ['customerService.pruneCustomerOperationalData', 'fileStore.writeJsonFile(analytics-events.json)'],
  ['AnalyticsController.exportBusinessMetricsCsv', 'analyticsService.exportBusinessMetricsCsv'],
  ['analyticsService.exportBusinessMetricsCsv', 'fileStore.readJsonFile(customers.json)'],
  ['analyticsService.exportBusinessMetricsCsv', 'fs.writeFile(customer-analytics-*.csv)'],
  ['analyticsService.exportBusinessMetricsCsv', 'fs.writeFile(carts-analytics-*.csv)']
];

function buildLocalhostSeedFlow(endpoints) {
  const {
    storefrontBase,
    serverBase,
    adminBase,
  } = endpoints;

  return [
    ['browser:http://localhost', `storefront:${storefrontBase}/walmart`],
    [`storefront:${storefrontBase}/walmart`, `server:${serverBase}/api/products`],
    [`storefront:${storefrontBase}/product/:id`, `server:${serverBase}/api/products`],
    [`storefront:${storefrontBase}/cart`, `server:${serverBase}/api/orders`],
    [`storefront:${storefrontBase}/checkout`, `server:${serverBase}/webhooks/stripe`],
    ['browser:http://localhost', `admin-console:${adminBase}/admin`],
    [`admin-console:${adminBase}/admin`, `server:${serverBase}/api/admin/products`],
    [`admin-console:${adminBase}/admin`, `server:${serverBase}/api/admin/categories`],
    [`admin-console:${adminBase}/admin`, `server:${serverBase}/api/admin/orders`],
    [`server:${serverBase}/api/admin/products`, 'fileStore:admin-console/database/data/products.json'],
    [`server:${serverBase}/api/admin/categories`, 'fileStore:admin-console/database/data/categories.json'],
    [`server:${serverBase}/api/admin/orders`, 'fileStore:admin-console/database/data/orders.json'],
    [`server:${serverBase}/api/products`, 'walmart:templates/default/home/homePage.html'],
    [`server:${serverBase}/api/orders`, 'walmart:templates/default/checkout/checkoutPage.html']
  ];
}

module.exports = { CORE_FLOW, buildLocalhostSeedFlow };
