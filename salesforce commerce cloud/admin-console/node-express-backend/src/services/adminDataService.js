const { readCollection, writeCollection } = require('../../../database/fileDatabase');

const FILES = {
  products: 'products.json',
  categories: 'categories.json',
  orders: 'orders.json',
};

function getProducts() {
  return readCollection(FILES.products);
}

function getCategories() {
  return readCollection(FILES.categories);
}

function getOrders() {
  return readCollection(FILES.orders);
}

async function createProduct(input) {
  const products = await getProducts();
  const now = new Date().toISOString();

  const newProduct = {
    id: `p${Date.now()}`,
    name: String(input.name || '').trim(),
    description: String(input.description || '').trim(),
    price: Number(input.price) || 0,
    category: String(input.category || 'Uncategorized').trim(),
    inventory: Number(input.inventory) || 0,
    status: String(input.status || 'Draft').trim(),
    updated: now,
  };

  products.push(newProduct);
  await writeCollection(FILES.products, products);
  return newProduct;
}

async function updateProduct(id, patch) {
  const products = await getProducts();
  const index = products.findIndex((product) => String(product.id) === String(id));

  if (index === -1) {
    return null;
  }

  const existing = products[index];
  const updated = {
    ...existing,
    ...patch,
    id: existing.id,
    updated: new Date().toISOString(),
  };

  if (typeof updated.price !== 'undefined') {
    updated.price = Number(updated.price) || 0;
  }

  if (typeof updated.inventory !== 'undefined') {
    updated.inventory = Number(updated.inventory) || 0;
  }

  products[index] = updated;
  await writeCollection(FILES.products, products);
  return updated;
}

async function deleteProduct(id) {
  const products = await getProducts();
  const index = products.findIndex((product) => String(product.id) === String(id));

  if (index === -1) {
    return false;
  }

  products.splice(index, 1);
  await writeCollection(FILES.products, products);
  return true;
}

module.exports = {
  getProducts,
  getCategories,
  getOrders,
  createProduct,
  updateProduct,
  deleteProduct,
};
