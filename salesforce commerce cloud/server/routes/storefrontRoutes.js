const express = require('express');
const HomeController = require('../controllers/storefront/Home');
const ProductController = require('../controllers/storefront/Product');
const CartController = require('../controllers/storefront/Cart');
const AccountController = require('../controllers/storefront/Account');
const CheckoutController = require('../controllers/storefront/Checkout');
const MyOrdersController = require('../controllers/storefront/MyOrders');
const CategoryController = require('../controllers/storefront/Category');

const router = express.Router();

// Canonical storefront routes (Walmart implementation).
router.get('/', HomeController.showHome);
router.get('/walmart', HomeController.showHome);
router.get('/product/:id', ProductController.showProduct);
router.get('/cart', CartController.showCart);
router.get('/account', AccountController.showAccount);
router.get('/checkout', CheckoutController.showCheckout);
router.get('/my-orders', MyOrdersController.showMyOrders);
router.get('/category', CategoryController.showCategory);

module.exports = router;
