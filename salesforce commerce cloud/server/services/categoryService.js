const { readJsonFile } = require('../utils/fileStore');

const CATEGORIES_FILE = 'categories.json';

// Return all categories from shared data.
async function getAllCategories() {
  return readJsonFile(CATEGORIES_FILE);
}

module.exports = {
  getAllCategories,
};
