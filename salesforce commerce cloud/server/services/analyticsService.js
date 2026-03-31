const { createUserSession } = require('../models/userSession');
const { createSessionEvent } = require('../models/sessionEvent');
const { readJsonFile } = require('../utils/fileStore');
const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;
const EXPORT_DIR = path.join(__dirname, '../../admin-console/database/data-console-exports');
const ANALYTICS_SESSIONS_FILE = path.join(__dirname, '../../admin-console/database/data/analytics-sessions.json');
const ANALYTICS_EVENTS_FILE = path.join(__dirname, '../../admin-console/database/data/analytics-events.json');

class AnalyticsService {
  constructor(options = {}) {
    this.persistenceEnabled = options.persistenceEnabled !== false;
    this.sessions = new Map();
    this.events = [];
    if (this.persistenceEnabled) {
      this.hydrateFromDisk();
    }
  }

  nowIso() {
    return new Date().toISOString();
  }

  minutesBetween(startIso, endIso) {
    return Number(((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000).toFixed(2));
  }

  logEvent(session, eventType, eventData = {}, timestamp) {
    const createdAt = timestamp || this.nowIso();
    session.lastActivityAt = createdAt;
    const event = createSessionEvent({
      sessionId: session.sessionId,
      customerId: session.customerId,
      eventType,
      eventData,
      createdAt,
    });
    this.events.push(event);
    this.persistState();
    return event;
  }

  hydrateFromDisk() {
    try {
      if (fsSync.existsSync(ANALYTICS_SESSIONS_FILE)) {
        const sessionsPayload = fsSync.readFileSync(ANALYTICS_SESSIONS_FILE, 'utf8');
        const sessionRows = JSON.parse(sessionsPayload || '[]');
        this.sessions = new Map(sessionRows.map((session) => [session.sessionId, session]));
      }

      if (fsSync.existsSync(ANALYTICS_EVENTS_FILE)) {
        const eventsPayload = fsSync.readFileSync(ANALYTICS_EVENTS_FILE, 'utf8');
        this.events = JSON.parse(eventsPayload || '[]');
      }
    } catch (error) {
      this.sessions = new Map();
      this.events = [];
    }
  }

  persistState() {
    if (!this.persistenceEnabled) {
      return;
    }
    try {
      fsSync.writeFileSync(ANALYTICS_SESSIONS_FILE, JSON.stringify(this.getAllSessions(), null, 2), 'utf8');
      fsSync.writeFileSync(ANALYTICS_EVENTS_FILE, JSON.stringify(this.events, null, 2), 'utf8');
    } catch (error) {
      // Intentionally swallow persistence errors to avoid blocking request flow in local dev.
    }
  }

  recordLoggedInDuration(session, endedAt) {
    if (!session.lastLoginAt) return;
    const minutes = Math.max(0, this.minutesBetween(session.lastLoginAt, endedAt));
    session.loggedInMinutes = Number((session.loggedInMinutes + minutes).toFixed(2));
    session.lastLoginAt = null;
  }

  getOrCreateSession(payload) {
    let session = this.sessions.get(payload.sessionId);
    if (!session) {
      session = createUserSession({
        sessionId: payload.sessionId,
        customerId: payload.customerId || 'guest',
        isLoggedIn: Boolean(payload.isLoggedIn),
        startedAt: payload.timestamp || this.nowIso(),
      });
      this.sessions.set(session.sessionId, session);
    }
    return session;
  }

  startSession(payload) {
    const session = this.getOrCreateSession(payload);

    if (session.status === 'ended') {
      session.status = 'active';
      session.endedAt = null;
      session.sessionDurationMinutes = 0;
    }

    if (payload.customerId && payload.customerId !== 'guest') {
      session.customerId = payload.customerId;
    }

    if (payload.isLoggedIn !== undefined) {
      session.isLoggedIn = Boolean(payload.isLoggedIn);
      if (session.isLoggedIn && !session.lastLoginAt) {
        session.lastLoginAt = payload.timestamp || this.nowIso();
      }
    }

    this.logEvent(session, 'session_start', {}, payload.timestamp);
    this.persistState();
    return session;
  }

  logLogin(payload) {
    const session = this.getOrCreateSession(payload);
    session.isLoggedIn = true;
    if (payload.customerId && session.customerId === 'guest') {
      session.customerId = payload.customerId;
    }
    session.lastLoginAt = payload.timestamp || this.nowIso();
    this.logEvent(session, 'login', {}, payload.timestamp);
    this.persistState();
    return session;
  }

  logLogout(payload) {
    const session = this.getOrCreateSession(payload);
    const now = payload.timestamp || this.nowIso();
    this.recordLoggedInDuration(session, now);
    session.isLoggedIn = false;
    this.logEvent(session, 'logout', { loggedInMinutes: session.loggedInMinutes }, now);
    this.persistState();
    return session;
  }

  trackCategoryClick(payload) {
    const session = this.getOrCreateSession(payload);
    session.categoryClickCount += 1;
    this.logEvent(session, 'category_click', {
      categoryId: payload.categoryId,
      categoryName: payload.categoryName,
      timestamp: payload.timestamp || this.nowIso(),
    }, payload.timestamp);
    this.persistState();
    return session;
  }

  trackProductClick(payload) {
    const session = this.getOrCreateSession(payload);
    session.productClickCount += 1;
    this.logEvent(session, 'product_click', {
      productId: payload.productId,
      productName: payload.productName,
      sourcePage: payload.sourcePage,
      sourceSection: payload.sourceSection,
      timestamp: payload.timestamp || this.nowIso(),
    }, payload.timestamp);
    this.persistState();
    return session;
  }

  trackAddToCart(payload) {
    const session = this.getOrCreateSession(payload);
    session.addToCartCount += 1;
    session.cartItemCount += Number(payload.quantity || 1);
    session.cartValue += Number(payload.price || 0) * Number(payload.quantity || 1);
    session.lastCartUpdateAt = payload.timestamp || this.nowIso();
    this.logEvent(session, 'add_to_cart', {
      productId: payload.productId,
      productName: payload.productName,
      quantity: payload.quantity || 1,
      price: payload.price || 0,
      timestamp: payload.timestamp || this.nowIso(),
    }, payload.timestamp);
    this.persistState();
    return session;
  }

  trackCheckoutStart(payload) {
    const session = this.getOrCreateSession(payload);
    this.logEvent(session, 'checkout_start', {
      cartItemCount: session.cartItemCount,
      cartValue: session.cartValue,
      timestamp: payload.timestamp || this.nowIso(),
    }, payload.timestamp);
    this.persistState();
    return session;
  }

  trackPurchaseComplete(payload) {
    const session = this.getOrCreateSession(payload);
    session.hasPurchase = true;
    session.cartAbandoned = false;
    this.logEvent(session, 'purchase_complete', {
      orderId: payload.orderId,
      total: Number(payload.total || 0),
      timestamp: payload.timestamp || this.nowIso(),
    }, payload.timestamp);
    this.persistState();
    return session;
  }

  trackReturn(payload) {
    const session = this.getOrCreateSession(payload);
    this.logEvent(session, 'purchase_return', {
      orderId: payload.orderId,
      reason: payload.reason || '',
      timestamp: payload.timestamp || this.nowIso(),
    }, payload.timestamp);
    this.persistState();
    return session;
  }

  endSession(payload) {
    const session = this.getOrCreateSession(payload);
    const now = payload.timestamp || this.nowIso();
    if (session.isLoggedIn) {
      this.recordLoggedInDuration(session, now);
      session.isLoggedIn = false;
    }

    session.endedAt = now;
    session.status = 'ended';
    session.sessionDurationMinutes = Math.max(0, this.minutesBetween(session.startedAt, now));

    this.logEvent(session, 'session_end', {
      sessionDurationMinutes: session.sessionDurationMinutes,
      loggedInMinutes: session.loggedInMinutes,
    }, now);

    this.evaluateCartAbandonment(session.sessionId);
    this.persistState();
    return session;
  }

  evaluateCartAbandonment(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const last = new Date(session.lastActivityAt).getTime();
    const now = Date.now();
    const inactiveTooLong = now - last >= INACTIVITY_TIMEOUT_MS || session.status === 'ended';

    if (inactiveTooLong && session.addToCartCount > 0 && !session.hasPurchase && !session.cartAbandoned) {
      session.cartAbandoned = true;
      this.logEvent(session, 'cart_abandon', {
        cartItemCount: session.cartItemCount,
        cartValue: session.cartValue,
        lastCartUpdateAt: session.lastCartUpdateAt,
        abandonedAt: this.nowIso(),
      });
    }
    this.persistState();
    return session;
  }

  getAllSessions() {
    return [...this.sessions.values()];
  }

  getSessionById(sessionId) {
    return this.sessions.get(sessionId) || null;
  }

  getSessionTimeline(sessionId) {
    return this.events.filter((evt) => evt.sessionId === sessionId);
  }

  getEventsByType(eventType) {
    return this.events.filter((evt) => evt.eventType === eventType);
  }

  async getBusinessMetrics(customerId = 'all') {
    const normalizedCustomerId = String(customerId || 'all');
    const isAllCustomers = normalizedCustomerId === 'all';
    const matchesCustomer = (value) => isAllCustomers || String(value || '') === normalizedCustomerId;

    const sessions = this.getAllSessions().filter((session) => session.customerId && session.customerId !== 'guest' && matchesCustomer(session.customerId));
    const products = await readJsonFile('products.json');
    const orders = await readJsonFile('orders.json');
    const customers = await readJsonFile('customers.json');

    const productById = new Map(products.map((product) => [String(product.id), product]));
    const scopedOrders = orders.filter((order) => matchesCustomer(order.customerId));
    const purchaseOrders = scopedOrders.filter((order) => !['cancelled', 'failed'].includes(String(order.status || '').toLowerCase()));
    const returnOrders = scopedOrders.filter((order) => ['returned', 'refunded'].includes(String(order.status || '').toLowerCase()));

    const signedInSessionIds = new Set(sessions.map((session) => session.sessionId));
    const signedInEvents = this.events.filter((event) => signedInSessionIds.has(event.sessionId));

    const productViews = signedInEvents.filter((event) => event.eventType === 'product_click');
    const addToCartEvents = signedInEvents.filter((event) => event.eventType === 'add_to_cart');
    const checkoutStarts = signedInEvents.filter((event) => event.eventType === 'checkout_start');
    const completedPurchasesFromEvents = signedInEvents.filter((event) => event.eventType === 'purchase_complete');
    const cartAbandons = signedInEvents.filter((event) => event.eventType === 'cart_abandon');
    const loginEvents = signedInEvents.filter((event) => event.eventType === 'login');
    const logoutEvents = signedInEvents.filter((event) => event.eventType === 'logout');

    const uniqueVisitorIds = new Set(sessions.map((session) => String(session.customerId)));
    const purchasingCustomers = new Map();
    purchaseOrders.forEach((order) => {
      const scopedCustomerId = String(order.customerId || 'guest');
      purchasingCustomers.set(scopedCustomerId, (purchasingCustomers.get(scopedCustomerId) || 0) + 1);
    });

    const revenueByCategoryMap = new Map();
    const soldByProductMap = new Map();
    let unitsSold = 0;
    let totalRevenue = 0;

    purchaseOrders.forEach((order) => {
      const orderTotal = Number(order.total || 0);
      totalRevenue += orderTotal;

      const items = Array.isArray(order.items) ? order.items : [];
      items.forEach((item) => {
        const quantity = Number(item.quantity || 0);
        unitsSold += quantity;

        const productId = String(item.productId || '');
        const product = productById.get(productId);
        const category = String(product?.category || 'Uncategorized');
        const unitPrice = Number(product?.price || 0);
        const itemRevenue = unitPrice * quantity;

        revenueByCategoryMap.set(category, Number((revenueByCategoryMap.get(category) || 0) + itemRevenue));

        const existing = soldByProductMap.get(productId) || {
          productId,
          productName: String(product?.name || 'Unknown product'),
          category,
          unitsSold: 0,
          revenue: 0,
          inventory: Number(product?.inventory || 0),
        };

        existing.unitsSold += quantity;
        existing.revenue = Number((existing.revenue + itemRevenue).toFixed(2));
        soldByProductMap.set(productId, existing);
      });
    });

    const productViewCountByProduct = new Map();
    const addToCartCountByProduct = new Map();
    const completedPurchaseCountByProduct = new Map();
    const returnCountByProduct = new Map();

    productViews.forEach((event) => {
      const productId = String(event.eventData.productId || '');
      if (!productId) return;
      productViewCountByProduct.set(productId, (productViewCountByProduct.get(productId) || 0) + 1);
    });
    addToCartEvents.forEach((event) => {
      const productId = String(event.eventData.productId || '');
      if (!productId) return;
      addToCartCountByProduct.set(productId, (addToCartCountByProduct.get(productId) || 0) + 1);
    });
    purchaseOrders.forEach((order) => {
      const items = Array.isArray(order.items) ? order.items : [];
      items.forEach((item) => {
        const productId = String(item.productId || '');
        if (!productId) return;
        completedPurchaseCountByProduct.set(productId, (completedPurchaseCountByProduct.get(productId) || 0) + 1);
      });
    });
    returnOrders.forEach((order) => {
      const items = Array.isArray(order.items) ? order.items : [];
      items.forEach((item) => {
        const productId = String(item.productId || '');
        if (!productId) return;
        returnCountByProduct.set(productId, (returnCountByProduct.get(productId) || 0) + 1);
      });
    });

    const repeatCustomerCount = [...purchasingCustomers.values()].filter((count) => count > 1).length;
    const repeatPurchaseRate = purchasingCustomers.size
      ? Number((repeatCustomerCount / purchasingCustomers.size).toFixed(4))
      : 0;
    const avgSessionDurationMinutes = sessions.length
      ? Number((sessions.reduce((sum, session) => sum + Number(session.sessionDurationMinutes || 0), 0) / sessions.length).toFixed(2))
      : 0;
    const avgLoggedInMinutes = sessions.length
      ? Number((sessions.reduce((sum, session) => sum + Number(session.loggedInMinutes || 0), 0) / sessions.length).toFixed(2))
      : 0;
    const cartToCheckoutRate = addToCartEvents.length
      ? Number((checkoutStarts.length / addToCartEvents.length).toFixed(4))
      : 0;
    const checkoutToPurchaseRate = checkoutStarts.length
      ? Number((Math.max(completedPurchasesFromEvents.length, purchaseOrders.length) / checkoutStarts.length).toFixed(4))
      : 0;

    const revenueByCategory = [...revenueByCategoryMap.entries()]
      .map(([category, revenue]) => ({ category, revenue: Number(revenue.toFixed(2)) }))
      .sort((a, b) => b.revenue - a.revenue);

    const topSellingProducts = [...soldByProductMap.values()]
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 10);

    const lowStockCount = products.filter((product) => {
      const inventory = Number(product.inventory || 0);
      return inventory > 0 && inventory < 10;
    }).length;
    const outOfStockCount = products.filter((product) => Number(product.inventory || 0) === 0).length;
    const activeProductsCount = products.filter((product) => !product.retired).length;
    const retiredProductsCount = products.filter((product) => Boolean(product.retired)).length;
    const totalInventoryUnits = products.reduce((sum, product) => sum + Number(product.inventory || 0), 0);
    const inventoryTurnoverRate = totalInventoryUnits > 0 ? Number((unitsSold / totalInventoryUnits).toFixed(4)) : 0;
    const sellThroughRate = (unitsSold + totalInventoryUnits) > 0
      ? Number((unitsSold / (unitsSold + totalInventoryUnits)).toFixed(4))
      : 0;
    const grossRevenuePerVisitor = uniqueVisitorIds.size > 0
      ? Number((totalRevenue / uniqueVisitorIds.size).toFixed(2))
      : 0;

    const productInsights = products.map((product) => {
      const productId = String(product.id);
      const inventory = Number(product.inventory || 0);
      const views = productViewCountByProduct.get(productId) || 0;
      const adds = addToCartCountByProduct.get(productId) || 0;
      const purchases = completedPurchaseCountByProduct.get(productId) || 0;
      const returns = returnCountByProduct.get(productId) || 0;
      const salesVelocity = purchases;
      const conversion = views > 0 ? purchases / views : 0;
      const returnRate = purchases > 0 ? returns / purchases : 0;
      const updatedAt = product.updated || product.createdAt || null;
      const stockAgeDays = updatedAt
        ? Math.max(0, Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24)))
        : 180;
      return {
        productId,
        name: product.name,
        category: product.category,
        inventory,
        views,
        adds,
        purchases,
        returns,
        salesVelocity,
        conversion,
        returnRate,
        stockAgeDays,
      };
    });

    const urgentRestocks = productInsights
      .filter((item) => item.salesVelocity >= 2 && item.inventory > 0 && item.inventory < 10)
      .map((item) => ({ ...item, insightReason: 'High sales velocity with low remaining inventory.' }))
      .sort((a, b) => b.salesVelocity - a.salesVelocity);
    const failingProducts = productInsights
      .filter((item) => item.views >= 3 && item.purchases <= 1 && item.returns >= 1 && item.conversion <= 0.1)
      .map((item) => ({ ...item, insightReason: 'Low sales with elevated returns and low conversion.' }))
      .sort((a, b) => b.returns - a.returns);
    const frictionProducts = productInsights
      .filter((item) => item.views >= 5 && item.adds >= 2 && item.purchases === 0)
      .map((item) => ({ ...item, insightReason: 'Shoppers engage and add to cart, but purchases do not complete.' }))
      .sort((a, b) => b.adds - a.adds);
    const deadInventory = productInsights
      .filter((item) => item.views <= 2 && item.purchases === 0 && item.stockAgeDays >= 90)
      .map((item) => ({ ...item, insightReason: 'Low traffic/sales and aged inventory suggest stagnant stock.' }))
      .sort((a, b) => b.stockAgeDays - a.stockAgeDays);

    const fillIfEmpty = (items, fallbackItems) => (items.length ? items : fallbackItems.slice(0, 3));
    const urgentRestocksFallback = productInsights
      .filter((item) => item.purchases > 0)
      .sort((a, b) => (b.purchases / Math.max(1, b.inventory)) - (a.purchases / Math.max(1, a.inventory)))
      .map((item) => ({ ...item, insightReason: 'Potential restock watchlist based on sales-to-inventory ratio.' }));
    const deadFallback = productInsights
      .sort((a, b) => (b.stockAgeDays - b.purchases) - (a.stockAgeDays - a.purchases))
      .map((item) => ({ ...item, insightReason: 'Potential stagnant inventory based on age and sales volume.' }));

    return {
      consumer: {
        sessionCount: sessions.length,
        uniqueVisitorsOrCustomers: uniqueVisitorIds.size,
        productViewCount: productViews.length,
        addToCartCount: addToCartEvents.length,
        cartAbandonmentCount: cartAbandons.length,
        checkoutStartCount: checkoutStarts.length,
        completedPurchaseCount: Math.max(completedPurchasesFromEvents.length, purchaseOrders.length),
        repeatCustomerCount,
        repeatPurchaseRate,
        avgSessionDurationMinutes,
        avgLoggedInMinutes,
        loginEventCount: loginEvents.length,
        logoutEventCount: logoutEvents.length,
        cartToCheckoutRate,
        checkoutToPurchaseRate,
      },
      producer: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalOrders: scopedOrders.length,
        averageOrderValue: purchaseOrders.length ? Number((totalRevenue / purchaseOrders.length).toFixed(2)) : 0,
        unitsSold,
        revenueByCategory,
        topSellingProducts,
        lowStockCount,
        outOfStockCount,
        returnCount: returnOrders.length,
        returnRate: purchaseOrders.length ? Number((returnOrders.length / purchaseOrders.length).toFixed(4)) : 0,
        activeProductsCount,
        retiredProductsCount,
        inventoryTurnoverRate,
        sellThroughRate,
        grossRevenuePerVisitor,
      },
      combinedInsights: {
        urgentRestocks: fillIfEmpty(urgentRestocks, urgentRestocksFallback),
        failingProducts,
        frictionProducts,
        deadInventory: fillIfEmpty(deadInventory, deadFallback),
      },
      scope: {
        customerId: isAllCustomers ? 'all' : normalizedCustomerId,
        totalCustomers: customers.length,
      },
    };
  }

  async exportBusinessMetricsCsv(type = 'all') {
    const metrics = await this.getBusinessMetrics();
    await fs.mkdir(EXPORT_DIR, { recursive: true });
    const stamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-');

    const customerFile = `customer-analytics-${stamp}.csv`;
    const producerFile = `producer-analytics-${stamp}.csv`;
    const insightFile = `combined-insights-${stamp}.csv`;

    const customerRows = [
      ['metric', 'value'],
      ...Object.entries(metrics.consumer).map(([key, value]) => [key, String(value)]),
    ];
    const producerRows = [
      ['metric', 'value'],
      ...Object.entries(metrics.producer)
        .filter(([, value]) => !Array.isArray(value))
        .map(([key, value]) => [key, String(value)]),
    ];

    const insightRows = [
      ['insightType', 'productId', 'name', 'category', 'inventory', 'views', 'adds', 'purchases', 'returns', 'stockAgeDays'],
    ];
    const pushInsights = (type, items) => {
      (items || []).forEach((item) => {
        insightRows.push([
          type,
          String(item.productId || ''),
          String(item.name || ''),
          String(item.category || ''),
          String(item.inventory || 0),
          String(item.views || 0),
          String(item.adds || 0),
          String(item.purchases || 0),
          String(item.returns || 0),
          String(item.stockAgeDays || 0),
        ]);
      });
    };
    pushInsights('urgentRestocks', metrics.combinedInsights.urgentRestocks);
    pushInsights('failingProducts', metrics.combinedInsights.failingProducts);
    pushInsights('frictionProducts', metrics.combinedInsights.frictionProducts);
    pushInsights('deadInventory', metrics.combinedInsights.deadInventory);

    const toCsv = (rows) => rows
      .map((row) => row.map((cell) => {
        const normalized = String(cell ?? '');
        if (/[,"\n]/.test(normalized)) return `"${normalized.replaceAll('"', '""')}"`;
        return normalized;
      }).join(','))
      .join('\n');

    const files = [];
    if (type === 'all' || type === 'customer') {
      await fs.writeFile(path.join(EXPORT_DIR, customerFile), toCsv(customerRows), 'utf8');
      files.push({ type: 'customer', file: customerFile });
    }
    if (type === 'all' || type === 'producer') {
      await fs.writeFile(path.join(EXPORT_DIR, producerFile), toCsv(producerRows), 'utf8');
      files.push({ type: 'producer', file: producerFile });
    }
    if (type === 'all' || type === 'combined_insights') {
      await fs.writeFile(path.join(EXPORT_DIR, insightFile), toCsv(insightRows), 'utf8');
      files.push({ type: 'combined_insights', file: insightFile });
    }

    return { directory: EXPORT_DIR, files };
  }
}

module.exports = { AnalyticsService, INACTIVITY_TIMEOUT_MS };
