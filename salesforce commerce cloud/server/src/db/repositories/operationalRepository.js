class OperationalRepository {
  constructor() {
    this.products = new Map();
    this.customers = new Map();
    this.orders = [];
    this.carts = new Map();
  }

  upsertProduct(product) { this.products.set(product.id, product); return product; }
  upsertCustomer(customer) { this.customers.set(customer.id, customer); return customer; }
  addOrder(order) { this.orders.push(order); return order; }

  addToCart(customerId, item) {
    const existing = this.carts.get(customerId) || [];
    existing.push(item);
    this.carts.set(customerId, existing);
    return existing;
  }

  removeFromCart(customerId, productId) {
    const existing = this.carts.get(customerId) || [];
    const next = existing.filter((item) => item.productId !== productId);
    this.carts.set(customerId, next);
    return next;
  }

  getOrders() { return this.orders; }
  getProductById(id) { return this.products.get(id) || null; }
}

module.exports = { OperationalRepository };
