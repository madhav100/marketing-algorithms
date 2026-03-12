const express = require('express');
const productApiController = require('../../controllers/api/productApiController');

const router = express.Router();

// Product CRUD API endpoints.
router.get('/', productApiController.getProducts);
router.get('/:id', productApiController.getProductById);
router.post('/', productApiController.createProduct);
router.put('/:id', productApiController.updateProduct);
router.delete('/:id', productApiController.deleteProduct);

module.exports = router;
