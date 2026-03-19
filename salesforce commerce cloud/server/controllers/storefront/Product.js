const productService = require('../../services/productService');

function getProductImage(product) {
  if (product.category === 'Electronics') {
    return '/client/default/images/products/wireless-earbuds.svg';
  }

  if (product.category === 'Apparel') {
    return '/client/default/images/products/cotton-tshirt.svg';
  }

  return '/client/default/images/products/fresh-apples.svg';
}

function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

// Render canonical Walmart product detail page from shared data.
async function showProduct(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id);

    if (!product) {
      return res.status(404).send('Product not found');
    }

    return res.render('product/productPage.html', {
      productId: String(product.id),
      title: product.name,
      image: getProductImage(product),
      price: formatPrice(product.price),
      priceValue: Number(product.price || 0),
      stock: `${Number(product.inventory || 0)} in stock`,
      description: product.description || 'No description provided.',
      variants: [
        { id: 'standard', label: 'Standard' },
        { id: 'plus', label: 'Plus' },
        { id: 'premium', label: 'Premium' },
      ],
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  showProduct,
};
