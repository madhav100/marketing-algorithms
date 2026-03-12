const express = require('express');
const categoryApiController = require('../../controllers/api/categoryApiController');

const router = express.Router();

// Category list API endpoint.
router.get('/', categoryApiController.getCategories);

module.exports = router;
