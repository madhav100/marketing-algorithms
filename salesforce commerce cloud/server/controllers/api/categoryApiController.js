const categoryService = require('../../services/categoryService');

// Handle GET /api/categories.
async function getCategories(req, res, next) {
  try {
    const categories = await categoryService.getAllCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCategories,
};
