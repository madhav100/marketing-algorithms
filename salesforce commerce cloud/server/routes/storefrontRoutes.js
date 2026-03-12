const express = require('express');
const HomeController = require('../controllers/storefront/Home');
const ProductController = require('../controllers/storefront/Product');
const CartController = require('../controllers/storefront/Cart');

const router = express.Router();

// Storefront page routes.
router.get('/', HomeController.showHome);
router.get('/product/:id', ProductController.showProduct);
router.get('/cart', CartController.showCart);

module.exports = router;
