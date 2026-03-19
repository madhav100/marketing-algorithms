const { readJsonFile, writeJsonFile } = require('../utils/fileStore');

const PRODUCTS_FILE = 'products.json';

function normalizeProductInput(data, existingProduct) {
  const base = existingProduct || {};

  return {
    ...base,
    name: String(typeof data.name !== 'undefined' ? data.name : base.name || '').trim(),
    description: String(typeof data.description !== 'undefined' ? data.description : base.description || '').trim(),
    image: String(typeof data.image !== 'undefined' ? data.image : base.image || '').trim(),
    price: Number(typeof data.price !== 'undefined' ? data.price : base.price || 0) || 0,
    category: String(typeof data.category !== 'undefined' ? data.category : base.category || 'Uncategorized').trim() || 'Uncategorized',
    inventory: Number(typeof data.inventory !== 'undefined' ? data.inventory : base.inventory || 0) || 0,
    status: String(typeof data.status !== 'undefined' ? data.status : base.status || 'Draft').trim() || 'Draft',
    updated: new Date().toISOString(),
  };
}

// Return all products from the shared JSON store.
async function getAllProducts() {
  return readJsonFile(PRODUCTS_FILE);
}

// Return a single product by ID.
async function getProductById(id) {
  const products = await getAllProducts();
  return products.find((product) => String(product.id) === String(id));
}

// Create a new product and persist it.
async function createProduct(data) {
  const products = await getAllProducts();
  const newProduct = {
    id: `p${Date.now()}`,
    ...normalizeProductInput(data),
  };

  products.push(newProduct);
  await writeJsonFile(PRODUCTS_FILE, products);
  return newProduct;
}

// Update an existing product by ID.
async function updateProduct(id, data) {
  const products = await getAllProducts();
  const index = products.findIndex((product) => String(product.id) === String(id));

  if (index === -1) {
    return null;
  }

  const updatedProduct = {
    id: products[index].id,
    ...normalizeProductInput(data, products[index]),
  };

  products[index] = updatedProduct;
  await writeJsonFile(PRODUCTS_FILE, products);
  return updatedProduct;
}

// Delete a product from the shared store.
async function deleteProduct(id) {
  const products = await getAllProducts();
  const index = products.findIndex((product) => String(product.id) === String(id));

  if (index === -1) {
    return false;
  }

  products.splice(index, 1);
  await writeJsonFile(PRODUCTS_FILE, products);
  return true;
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
