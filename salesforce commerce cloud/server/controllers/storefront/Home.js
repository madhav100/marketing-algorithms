const productService = require('../../services/productService');
const categoryService = require('../../services/categoryService');

// Render homepage with shared product and category data.
async function showHome(req, res, next) {
  try {
    const products = await productService.getAllProducts();
    const categories = await categoryService.getAllCategories();
    const featuredProducts = products.slice(0, 4);

    res.render('home.njk', {
      storeName: 'Local SFRA Store',
      welcomeMessage: 'Welcome to the local SFRA simulation storefront.',
      categories,
      featuredProducts,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  showHome,
};
