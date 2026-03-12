const express = require('express');
const adminDataService = require('../services/adminDataService');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ ok: true, service: 'admin-console-api' });
});

router.get('/products', async (req, res, next) => {
  try {
    const products = await adminDataService.getProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
});

router.post('/products', async (req, res, next) => {
  try {
    if (!req.body || !req.body.name) {
      return res.status(400).json({ message: 'Product name is required.' });
    }

    const product = await adminDataService.createProduct(req.body);
    return res.status(201).json(product);
  } catch (error) {
    return next(error);
  }
});

router.put('/products/:id', async (req, res, next) => {
  try {
    const updated = await adminDataService.updateProduct(req.params.id, req.body || {});

    if (!updated) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.json(updated);
  } catch (error) {
    return next(error);
  }
});

router.delete('/products/:id', async (req, res, next) => {
  try {
    const removed = await adminDataService.deleteProduct(req.params.id);

    if (!removed) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.get('/categories', async (req, res, next) => {
  try {
    const categories = await adminDataService.getCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

router.get('/orders', async (req, res, next) => {
  try {
    const orders = await adminDataService.getOrders();
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
