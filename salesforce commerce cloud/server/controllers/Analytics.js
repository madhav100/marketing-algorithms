const { AnalyticsService } = require('../services/analyticsService');

const analyticsService = new AnalyticsService();

function jsonOk(res, payload) {
  return res.status(200).json(payload);
}

function getPayload(req) {
  if (!req || req.body == null) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      return {};
    }
  }
  return req.body;
}

module.exports = {
  analyticsService,

  startSession(req, res) {
    return jsonOk(res, analyticsService.startSession(getPayload(req)));
  },

  logLogin(req, res) {
    return jsonOk(res, analyticsService.logLogin(getPayload(req)));
  },

  logLogout(req, res) {
    return jsonOk(res, analyticsService.logLogout(getPayload(req)));
  },

  categoryClick(req, res) {
    return jsonOk(res, analyticsService.trackCategoryClick(getPayload(req)));
  },

  productClick(req, res) {
    return jsonOk(res, analyticsService.trackProductClick(getPayload(req)));
  },

  addToCart(req, res) {
    return jsonOk(res, analyticsService.trackAddToCart(getPayload(req)));
  },

  checkoutStart(req, res) {
    return jsonOk(res, analyticsService.trackCheckoutStart(getPayload(req)));
  },

  purchaseComplete(req, res) {
    return jsonOk(res, analyticsService.trackPurchaseComplete(getPayload(req)));
  },

  purchaseReturn(req, res) {
    return jsonOk(res, analyticsService.trackReturn(getPayload(req)));
  },

  endSession(req, res) {
    return jsonOk(res, analyticsService.endSession(getPayload(req)));
  },

  getCustomerSessions(_req, res) {
    return jsonOk(res, analyticsService.getAllSessions());
  },

  getCustomerSessionById(req, res) {
    const session = analyticsService.getSessionById(req.params.sessionId);
    return jsonOk(res, {
      session,
      timeline: analyticsService.getSessionTimeline(req.params.sessionId),
    });
  },

  async getBusinessMetrics(req, res, next) {
    try {
      const metrics = await analyticsService.getBusinessMetrics(req.query.customerId || 'all');
      return jsonOk(res, metrics);
    } catch (error) {
      return next(error);
    }
  },

  async exportBusinessMetricsCsv(req, res, next) {
    try {
      const payload = getPayload(req);
      const exportResult = await analyticsService.exportBusinessMetricsCsv(payload.type || 'all');
      return jsonOk(res, exportResult);
    } catch (error) {
      return next(error);
    }
  },
};
