const STREAM_DEFINITIONS = [
  {
    fileName: 'customer_profiles.csv',
    entityName: 'customer_profiles',
    primaryKey: 'id',
    description: 'Customer identity, segmentation, and signup metadata.'
  },
  {
    fileName: 'customer_orders.csv',
    entityName: 'customer_orders',
    primaryKey: 'orderId',
    description: 'Order-level revenue facts including gross, discount, and net revenue.'
  },
  {
    fileName: 'customer_returns.csv',
    entityName: 'customer_returns',
    primaryKey: 'returnId',
    description: 'Return/refund events connected to customer orders.'
  },
  {
    fileName: 'customer_subscriptions.csv',
    entityName: 'customer_subscriptions',
    primaryKey: 'subscriptionId',
    description: 'Recurring-plan lifecycle and MRR attributes.'
  },
  {
    fileName: 'customer_support_tickets.csv',
    entityName: 'customer_support_tickets',
    primaryKey: 'ticketId',
    description: 'Operational support events for customer experience analysis.'
  }
];

module.exports = {
  STREAM_DEFINITIONS
};
