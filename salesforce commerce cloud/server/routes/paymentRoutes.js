const express = require('express');
const PaymentsController = require('../controllers/Payments');

const router = express.Router();

router.post('/payments/create-intent', PaymentsController.createIntent);
router.post('/payments/confirm-intent', PaymentsController.confirmIntent);

module.exports = router;
