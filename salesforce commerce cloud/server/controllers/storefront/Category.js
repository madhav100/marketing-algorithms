const productService = require('../../services/productService');
const categoryService = require('../../services/categoryService');
const storefrontCatalogService = require('../../services/storefrontCatalogService');

async function showCategory(req, res, next) {
  try {
    const products = await productService.getAllProducts();
    const categories = await categoryService.getAllCategories();
    const categorySections = storefrontCatalogService.buildCategorySections(categories, products);
    const selectedCategorySlug = req.query.category || '';

    return res.render('category/categoryPage.html', {
      storeName: 'Walmart',
      categories: categorySections,
      categorySections,
      selectedCategorySlug,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  showCategory,
};
