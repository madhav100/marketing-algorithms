const { readJsonFile, writeJsonFile } = require('../utils/fileStore');

const PRODUCTS_FILE = 'products.json';

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
    id: Date.now().toString(),
    name: data.name,
    description: data.description || '',
    price: Number(data.price) || 0,
    category: data.category || 'Uncategorized',
    inventory: Number(data.inventory) || 0,
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
    ...products[index],
    ...data,
    id: products[index].id,
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
