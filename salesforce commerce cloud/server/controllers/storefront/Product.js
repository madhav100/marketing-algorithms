const productService = require('../../services/productService');

// Render product detail page from shared data.
async function showProduct(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id);

    if (!product) {
      return res.status(404).send('Product not found');
    }

    return res.render('product.njk', { product });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  showProduct,
};
