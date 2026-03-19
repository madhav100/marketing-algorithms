const productService = require('../../services/productService');
const storefrontCatalogService = require('../../services/storefrontCatalogService');

// Render canonical Walmart product detail page from shared admin-managed data.
async function showProduct(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id);

    if (!product) {
      return res.status(404).send('Product not found');
    }

    const productCard = storefrontCatalogService.buildProductCard(product);

    return res.render('product/productPage.html', {
      productId: productCard.id,
      title: productCard.title,
      image: productCard.image,
      price: productCard.price,
      priceValue: productCard.priceValue,
      stock: productCard.stockLabel,
      description: productCard.description,
      categoryName: productCard.categoryName,
      status: productCard.status,
      updated: productCard.updated,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  showProduct,
};
