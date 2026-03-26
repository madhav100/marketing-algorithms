const { AnalyticsService } = require('../services/analyticsService');

const analyticsService = new AnalyticsService();

function jsonOk(res, payload) {
  return res.status(200).json(payload);
}

module.exports = {
  analyticsService,

  startSession(req, res) {
    return jsonOk(res, analyticsService.startSession(req.body || {}));
  },

  logLogin(req, res) {
    return jsonOk(res, analyticsService.logLogin(req.body || {}));
  },

  logLogout(req, res) {
    return jsonOk(res, analyticsService.logLogout(req.body || {}));
  },

  categoryClick(req, res) {
    return jsonOk(res, analyticsService.trackCategoryClick(req.body || {}));
  },

  productClick(req, res) {
    return jsonOk(res, analyticsService.trackProductClick(req.body || {}));
  },

  addToCart(req, res) {
    return jsonOk(res, analyticsService.trackAddToCart(req.body || {}));
  },

  endSession(req, res) {
    return jsonOk(res, analyticsService.endSession(req.body || {}));
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
};
