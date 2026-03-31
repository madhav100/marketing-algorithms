const customerService = require('../../services/customerService');
const orderService = require('../../services/orderService');
const { analyticsService } = require('../Analytics');

async function getCustomers(req, res, next) {
  try {
    const customers = await customerService.getCustomersWithStats();
    res.json(customers);
  } catch (error) {
    next(error);
  }
}

async function signUpCustomer(req, res, next) {
  try {
    const customer = await customerService.createCustomer(req.body);
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function signInCustomer(req, res, next) {
  try {
    const customer = await customerService.authenticateCustomer(req.body.phone, req.body.password);

    if (!customer) {
      return res.status(401).json({ message: 'Invalid phone number or password.' });
    }

    return res.json(customer);
  } catch (error) {
    return next(error);
  }
}

async function getCustomerOrders(req, res, next) {
  try {
    const customer = await customerService.getCustomerById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    const orders = await orderService.getOrdersByCustomerId(req.params.id);
    return res.json(orders);
  } catch (error) {
    return next(error);
  }
}

async function deleteCustomer(req, res, next) {
  try {
    const removed = await customerService.deleteCustomer(req.params.id);
    if (!removed) {
      return res.status(404).json({ message: 'Customer not found.' });
    }
    analyticsService.purgeCustomerData(req.params.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  deleteCustomer,
  getCustomerOrders,
  getCustomers,
  signInCustomer,
  signUpCustomer,
};
