const test = require('node:test');
const assert = require('node:assert/strict');

const { createDataCloudConnectivityRuntime } = require('../../data-cloud/src/connectivityRuntime');
const { createServerConnectivityRuntime } = require('../src/connectivityRuntime');
const { getProductPerformance } = require('../../admin-console/src/services/analyticsService');
const { trackEvent } = require('../../storefront/src/tracking/eventTracker');

test('server publishes async events and data cloud consumes them', () => {
  const dataCloud = createDataCloudConnectivityRuntime();
  const server = createServerConnectivityRuntime({
    getGovernedOutput: dataCloud.getGovernedOutput,
    dataCloudDbSyncConsumer: dataCloud.dbSyncConsumer,
  });

  server.storefrontController.addToCart({ body: { customerId: 'C1', productId: 'P1', quantity: 1 } });

  assert.equal(dataCloud.db.streamEvents.length, 1);
  assert.equal(dataCloud.db.streamEvents[0].type, 'add_to_cart');
});

test('admin writes go through server and can read governed outputs only', () => {
  const dataCloud = createDataCloudConnectivityRuntime();
  const server = createServerConnectivityRuntime({
    getGovernedOutput: dataCloud.getGovernedOutput,
    dataCloudDbSyncConsumer: dataCloud.dbSyncConsumer,
  });

  server.adminController.updateProduct({ role: 'admin', body: { id: 'P200', sku: 'SKU-1', orderValue: 50 } });

  const governed = server.governedDataController.dashboardSummary();
  assert.equal(typeof governed.totalEvents, 'number');
  assert.equal(governed.piiExposed, false);
});

test('blocking guards: no direct data-cloud URLs in outer-scope clients', () => {
  assert.equal(getProductPerformance.toString().includes('/internal/ingestion'), false);
  assert.equal(trackEvent.toString().includes('data-cloud'), false);
});

test('checkout is operational and not dependent on data cloud availability', () => {
  const dataCloud = createDataCloudConnectivityRuntime();
  const server = createServerConnectivityRuntime({
    getGovernedOutput: dataCloud.getGovernedOutput,
    dataCloudDbSyncConsumer: () => ({ accepted: false }),
  });

  const result = server.storefrontController.startCheckout({ body: { customerId: 'C100' } });
  assert.equal(result.status, 'checkout_started');
  assert.equal(result.sourceOfTruth, 'operational-db');
});
