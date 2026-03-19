const productService = require('../../services/productService');
const categoryService = require('../../services/categoryService');
const storefrontCatalogService = require('../../services/storefrontCatalogService');

// Render Walmart homepage using admin-managed categories and products.
async function showHome(req, res, next) {
  try {
    const products = await productService.getAllProducts();
    const categories = await categoryService.getAllCategories();
    const categorySections = storefrontCatalogService.buildCategorySections(categories, products);
    const totalProducts = categorySections.reduce((sum, category) => sum + category.productCount, 0);

    return res.render('home/homePage.html', {
      storeName: 'Walmart',
      welcomeMessage: 'We are glad you are here—discover everyday essentials, trending finds, and favorites picked for you.',
      promoMessage: 'Welcome! Explore products by category and add your favorites to the cart.',
      categories: categorySections,
      categorySections,
      totalProducts,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  showHome,
};
