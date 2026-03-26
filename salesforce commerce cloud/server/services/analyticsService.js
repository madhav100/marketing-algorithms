const { createUserSession } = require('../models/userSession');
const { createSessionEvent } = require('../models/sessionEvent');

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

class AnalyticsService {
  constructor() {
    this.sessions = new Map();
    this.events = [];
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
    return event;
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
    this.logEvent(session, 'session_start', {}, payload.timestamp);
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
    return session;
  }

  logLogout(payload) {
    const session = this.getOrCreateSession(payload);
    const now = payload.timestamp || this.nowIso();
    this.recordLoggedInDuration(session, now);
    session.isLoggedIn = false;
    this.logEvent(session, 'logout', { loggedInMinutes: session.loggedInMinutes }, now);
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
}

module.exports = { AnalyticsService, INACTIVITY_TIMEOUT_MS };
