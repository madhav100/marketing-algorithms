const express = require('express');
const PaymentsController = require('../controllers/Payments');

const router = express.Router();

router.post('/payments/create-intent', PaymentsController.createIntent);

module.exports = router;
