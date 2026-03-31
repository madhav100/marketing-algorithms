const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs/promises');
const path = require('path');

const { AnalyticsService } = require('../services/analyticsService');

test('tracks session lifecycle and timeline events', () => {
  const svc = new AnalyticsService({ persistenceEnabled: false });
  svc.startSession({ sessionId: 'sess_001', customerId: 'guest', timestamp: '2026-03-26T10:00:00.000Z' });
  svc.logLogin({ sessionId: 'sess_001', customerId: 'C123', timestamp: '2026-03-26T10:01:00.000Z' });
  svc.trackCategoryClick({ sessionId: 'sess_001', categoryId: 'cat1', categoryName: 'Shoes', timestamp: '2026-03-26T10:02:00.000Z' });
  svc.trackProductClick({ sessionId: 'sess_001', productId: 'P1', productName: 'Nike Shoes', sourcePage: 'category', sourceSection: 'featured-products', timestamp: '2026-03-26T10:03:00.000Z' });
  svc.trackAddToCart({ sessionId: 'sess_001', productId: 'P1', productName: 'Nike Shoes', quantity: 2, price: 50, timestamp: '2026-03-26T10:04:00.000Z' });
  svc.logLogout({ sessionId: 'sess_001', timestamp: '2026-03-26T10:11:00.000Z' });
  svc.endSession({ sessionId: 'sess_001', timestamp: '2026-03-26T10:15:00.000Z' });

  const session = svc.getSessionById('sess_001');
  assert.equal(session.customerId, 'C123');
  assert.equal(session.categoryClickCount, 1);
  assert.equal(session.productClickCount, 1);
  assert.equal(session.addToCartCount, 1);
  assert.equal(session.cartValue, 100);
  assert.equal(session.loggedInMinutes, 10);
  assert.equal(session.sessionDurationMinutes, 15);

  const events = svc.getSessionTimeline('sess_001').map((e) => e.eventType);
  assert.deepEqual(events, ['session_start', 'login', 'category_click', 'product_click', 'add_to_cart', 'logout', 'session_end', 'cart_abandon']);
});

test('server-side cart abandonment decision', () => {
  const svc = new AnalyticsService({ persistenceEnabled: false });
  svc.startSession({ sessionId: 'sess_002' });
  svc.trackAddToCart({ sessionId: 'sess_002', productId: 'P2', quantity: 1, price: 20 });
  svc.endSession({ sessionId: 'sess_002' });

  const session = svc.getSessionById('sess_002');
  assert.equal(session.cartAbandoned, true);
});

test('computes consumer, producer, and combined business metrics', async () => {
  const svc = new AnalyticsService({ persistenceEnabled: false });
  svc.startSession({ sessionId: 'sess_101', customerId: 'cu9001', isLoggedIn: true, timestamp: '2026-03-26T10:00:00.000Z' });
  svc.logLogin({ sessionId: 'sess_101', customerId: 'cu9001', timestamp: '2026-03-26T10:00:30.000Z' });
  svc.trackProductClick({ sessionId: 'sess_101', productId: 'p1001', productName: 'Trail Running Shoes', timestamp: '2026-03-26T10:01:00.000Z' });
  svc.trackAddToCart({ sessionId: 'sess_101', productId: 'p1001', productName: 'Trail Running Shoes', quantity: 1, price: 129.99, timestamp: '2026-03-26T10:02:00.000Z' });
  svc.trackCheckoutStart({ sessionId: 'sess_101', timestamp: '2026-03-26T10:03:00.000Z' });
  svc.trackPurchaseComplete({ sessionId: 'sess_101', orderId: 'o_test_1', total: 129.99, timestamp: '2026-03-26T10:04:00.000Z' });
  svc.logLogout({ sessionId: 'sess_101', timestamp: '2026-03-26T10:04:30.000Z' });
  svc.endSession({ sessionId: 'sess_101', timestamp: '2026-03-26T10:05:00.000Z' });

  const metrics = await svc.getBusinessMetrics();

  assert.equal(metrics.consumer.sessionCount, 1);
  assert.equal(metrics.consumer.uniqueVisitorsOrCustomers, 1);
  assert.equal(metrics.consumer.productViewCount, 1);
  assert.equal(metrics.consumer.addToCartCount, 1);
  assert.equal(metrics.consumer.checkoutStartCount, 1);
  assert.equal(metrics.consumer.completedPurchaseCount, 2);
  assert.equal(metrics.consumer.loginEventCount, 1);
  assert.equal(metrics.consumer.logoutEventCount, 1);
  assert.equal(metrics.producer.totalOrders, 2);
  assert.equal(metrics.producer.totalRevenue, 308.98);
  assert.equal(metrics.producer.unitsSold, 4);
  assert.equal(metrics.producer.lowStockCount, 0);
  assert.equal(metrics.producer.outOfStockCount, 0);
  assert.equal(Array.isArray(metrics.producer.revenueByCategory), true);
  assert.equal(Array.isArray(metrics.producer.topSellingProducts), true);
  assert.equal(Array.isArray(metrics.combinedInsights.urgentRestocks), true);
  assert.equal(Array.isArray(metrics.combinedInsights.failingProducts), true);
  assert.equal(Array.isArray(metrics.combinedInsights.frictionProducts), true);
  assert.equal(Array.isArray(metrics.combinedInsights.deadInventory), true);
  assert.equal(metrics.combinedInsights.failingProducts.length, 0);
  assert.equal(metrics.combinedInsights.frictionProducts.length, 0);
});

test('exports analytics CSV files for data console ingestion', async () => {
  const svc = new AnalyticsService({ persistenceEnabled: false });
  svc.startSession({ sessionId: 'sess_301', customerId: 'cu9001', isLoggedIn: true, timestamp: '2026-03-26T10:00:00.000Z' });
  svc.trackProductClick({ sessionId: 'sess_301', productId: 'p1001', productName: 'Trail Running Shoes', timestamp: '2026-03-26T10:01:00.000Z' });
  svc.endSession({ sessionId: 'sess_301', timestamp: '2026-03-26T10:02:00.000Z' });

  const exportResult = await svc.exportBusinessMetricsCsv('all');
  assert.equal(Array.isArray(exportResult.files), true);
  assert.equal(exportResult.files.length, 3);
});

test('persists analytics sessions/events across service restart', async () => {
  const sessionsFile = path.join(__dirname, '../../admin-console/database/data/analytics-sessions.json');
  const eventsFile = path.join(__dirname, '../../admin-console/database/data/analytics-events.json');
  const backupSessions = await fs.readFile(sessionsFile, 'utf8').catch(() => null);
  const backupEvents = await fs.readFile(eventsFile, 'utf8').catch(() => null);

  try {
    const svc1 = new AnalyticsService({ persistenceEnabled: true });
    svc1.startSession({ sessionId: 'sess_persist_1', customerId: 'cu-persist', isLoggedIn: true, timestamp: '2026-03-26T10:00:00.000Z' });
    svc1.trackProductClick({ sessionId: 'sess_persist_1', customerId: 'cu-persist', productId: 'p1001', timestamp: '2026-03-26T10:01:00.000Z' });

    const svc2 = new AnalyticsService({ persistenceEnabled: true });
    const persistedSession = svc2.getSessionById('sess_persist_1');
    assert.equal(Boolean(persistedSession), true);
    const persistedEventTypes = svc2.getSessionTimeline('sess_persist_1').map((event) => event.eventType);
    assert.equal(persistedEventTypes.includes('product_click'), true);
  } finally {
    if (backupSessions === null) {
      await fs.unlink(sessionsFile).catch(() => {});
    } else {
      await fs.writeFile(sessionsFile, backupSessions, 'utf8');
    }

    if (backupEvents === null) {
      await fs.unlink(eventsFile).catch(() => {});
    } else {
      await fs.writeFile(eventsFile, backupEvents, 'utf8');
    }
  }
});
