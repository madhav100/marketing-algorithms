const test = require('node:test');
const assert = require('node:assert/strict');

const { AnalyticsService } = require('../services/analyticsService');

test('tracks session lifecycle and timeline events', () => {
  const svc = new AnalyticsService();
  svc.startSession({ sessionId: 'sess_001', customerId: 'guest' });
  svc.logLogin({ sessionId: 'sess_001', customerId: 'C123' });
  svc.trackCategoryClick({ sessionId: 'sess_001', categoryId: 'cat1', categoryName: 'Shoes' });
  svc.trackProductClick({ sessionId: 'sess_001', productId: 'P1', productName: 'Nike Shoes', sourcePage: 'category', sourceSection: 'featured-products' });
  svc.trackAddToCart({ sessionId: 'sess_001', productId: 'P1', productName: 'Nike Shoes', quantity: 2, price: 50 });
  svc.endSession({ sessionId: 'sess_001' });

  const session = svc.getSessionById('sess_001');
  assert.equal(session.customerId, 'C123');
  assert.equal(session.categoryClickCount, 1);
  assert.equal(session.productClickCount, 1);
  assert.equal(session.addToCartCount, 1);
  assert.equal(session.cartValue, 100);

  const events = svc.getSessionTimeline('sess_001').map((e) => e.eventType);
  assert.deepEqual(events, ['session_start', 'login', 'category_click', 'product_click', 'add_to_cart', 'session_end', 'cart_abandon']);
});

test('server-side cart abandonment decision', () => {
  const svc = new AnalyticsService();
  svc.startSession({ sessionId: 'sess_002' });
  svc.trackAddToCart({ sessionId: 'sess_002', productId: 'P2', quantity: 1, price: 20 });
  svc.endSession({ sessionId: 'sess_002' });

  const session = svc.getSessionById('sess_002');
  assert.equal(session.cartAbandoned, true);
});
