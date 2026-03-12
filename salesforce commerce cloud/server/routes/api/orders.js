const express = require('express');
const orderApiController = require('../../controllers/api/orderApiController');

const router = express.Router();

// Order list API endpoint.
router.get('/', orderApiController.getOrders);

module.exports = router;
