const express = require('express');
const AnalyticsController = require('../controllers/Analytics');

const router = express.Router();

router.post('/analytics/session/start', AnalyticsController.startSession);
router.post('/analytics/session/login', AnalyticsController.logLogin);
router.post('/analytics/session/logout', AnalyticsController.logLogout);
router.post('/analytics/category-click', AnalyticsController.categoryClick);
router.post('/analytics/product-click', AnalyticsController.productClick);
router.post('/analytics/add-to-cart', AnalyticsController.addToCart);
router.post('/analytics/checkout-start', AnalyticsController.checkoutStart);
router.post('/analytics/purchase-complete', AnalyticsController.purchaseComplete);
router.post('/analytics/purchase-return', AnalyticsController.purchaseReturn);
router.post('/analytics/session/end', AnalyticsController.endSession);

router.get('/admin/api/customer-sessions', AnalyticsController.getCustomerSessions);
router.get('/admin/api/customer-sessions/:sessionId', AnalyticsController.getCustomerSessionById);
router.get('/admin/api/analytics/business-metrics', AnalyticsController.getBusinessMetrics);

module.exports = router;
