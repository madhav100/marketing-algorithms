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
      welcomeMessage: 'Browse products that are managed directly from the admin console.',
      promoMessage: 'Categories and product details below are loaded from the shared admin database.',
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
