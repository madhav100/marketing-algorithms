const test = require('node:test');
const assert = require('node:assert/strict');

const { AnalyticsService } = require('../services/analyticsService');

test('tracks session lifecycle and timeline events', () => {
  const svc = new AnalyticsService();
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
  const svc = new AnalyticsService();
  svc.startSession({ sessionId: 'sess_002' });
  svc.trackAddToCart({ sessionId: 'sess_002', productId: 'P2', quantity: 1, price: 20 });
  svc.endSession({ sessionId: 'sess_002' });

  const session = svc.getSessionById('sess_002');
  assert.equal(session.cartAbandoned, true);
});
