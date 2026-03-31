const { readJsonFile, writeJsonFile } = require('../utils/fileStore');
const orderService = require('./orderService');

const CUSTOMERS_FILE = 'customers.json';

function sanitizeCustomer(customer) {
  if (!customer) {
    return null;
  }

  const { password, ...safeCustomer } = customer;
  return safeCustomer;
}

async function getAllCustomers() {
  return readJsonFile(CUSTOMERS_FILE);
}

async function getCustomerById(id) {
  const customers = await getAllCustomers();
  return customers.find((customer) => String(customer.id) === String(id));
}

async function getCustomersWithStats() {
  const [customers, orders] = await Promise.all([
    getAllCustomers(),
    orderService.getAllOrders(),
  ]);

  return customers.map((customer) => {
    const customerOrders = orders.filter((order) => String(order.customerId || '') === String(customer.id));

    return {
      ...sanitizeCustomer(customer),
      orderCount: customerOrders.length,
      lastOrderStatus: customerOrders.length ? customerOrders[0].status : 'No orders yet',
    };
  });
}

function normalizeCustomerInput(data, existingCustomer) {
  const base = existingCustomer || {};

  return {
    ...base,
    name: String(typeof data.name !== 'undefined' ? data.name : base.name || '').trim(),
    phone: String(typeof data.phone !== 'undefined' ? data.phone : base.phone || '').trim(),
    address: String(typeof data.address !== 'undefined' ? data.address : base.address || '').trim(),
    password: String(typeof data.password !== 'undefined' ? data.password : base.password || '').trim(),
    updated: new Date().toISOString(),
  };
}

async function createCustomer(data) {
  const customers = await getAllCustomers();
  const candidate = normalizeCustomerInput(data);

  if (!candidate.name || !candidate.phone || !candidate.address || !candidate.password) {
    throw new Error('Name, phone, address, and password are required.');
  }

  const existingCustomer = customers.find((customer) => customer.phone === candidate.phone);
  if (existingCustomer) {
    throw new Error('A customer account already exists for that phone number.');
  }

  const newCustomer = {
    id: `cu${Date.now()}`,
    created: new Date().toISOString(),
    ...candidate,
  };

  customers.push(newCustomer);
  await writeJsonFile(CUSTOMERS_FILE, customers);
  return sanitizeCustomer(newCustomer);
}

async function authenticateCustomer(phone, password) {
  const customers = await getAllCustomers();
  const customer = customers.find((item) => item.phone === String(phone || '').trim());

  if (!customer || customer.password !== String(password || '').trim()) {
    return null;
  }

  return sanitizeCustomer(customer);
}

async function deleteCustomer(id) {
  const customers = await getAllCustomers();
  const index = customers.findIndex((customer) => String(customer.id) === String(id));
  if (index === -1) return false;
  customers.splice(index, 1);
  await writeJsonFile(CUSTOMERS_FILE, customers);
  return true;
}

module.exports = {
  authenticateCustomer,
  createCustomer,
  deleteCustomer,
  getAllCustomers,
  getCustomerById,
  getCustomersWithStats,
  sanitizeCustomer,
};
