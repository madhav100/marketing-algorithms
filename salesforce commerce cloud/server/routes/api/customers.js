const express = require('express');
const customerApiController = require('../../controllers/api/customerApiController');

const router = express.Router();

router.get('/', customerApiController.getCustomers);
router.post('/sign-up', customerApiController.signUpCustomer);
router.post('/sign-in', customerApiController.signInCustomer);
router.get('/:id/orders', customerApiController.getCustomerOrders);

module.exports = router;
