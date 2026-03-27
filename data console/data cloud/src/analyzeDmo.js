const fs = require('fs');
const path = require('path');

function numberValue(value) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function groupBySegment(customers = []) {
  return customers.reduce((acc, customer) => {
    const segment = customer.segment || 'Unknown';
    if (!acc[segment]) {
      acc[segment] = [];
    }
    acc[segment].push(customer.customerId);
    return acc;
  }, {});
}

function monthKey(dateValue) {
  const raw = String(dateValue || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return 'Unknown';
  }
  return raw.slice(0, 7);
}

function analyzeDmoEntities(modeled = {}) {
  const customers = modeled.Customer_DMO || [];
  const orders = modeled.Order_DMO || [];
  const returns = modeled.Return_DMO || [];
  const subscriptions = modeled.Subscription_DMO || [];
  const tickets = modeled.SupportTicket_DMO || [];

  const customersBySegment = groupBySegment(customers);
  const customerToSegment = new Map(
    customers.map((customer) => [String(customer.customerId), customer.segment || 'Unknown'])
  );

  const segmentNames = Object.keys(customersBySegment).sort();

  const netRevenueBySegment = segmentNames.map((segment) => {
    const revenue = orders
      .filter((order) => customerToSegment.get(String(order.customerId)) === segment)
      .reduce((sum, order) => sum + numberValue(order.netRevenue), 0);

    return { segment, value: Number(revenue.toFixed(2)) };
  });

  const refundBySegment = segmentNames.map((segment) => {
    const segmentRevenue = netRevenueBySegment.find((entry) => entry.segment === segment)?.value || 0;
    const refundAmount = returns
      .filter((item) => customerToSegment.get(String(item.customerId)) === segment)
      .reduce((sum, item) => sum + numberValue(item.refundAmount), 0);
    const refundRate = segmentRevenue > 0 ? (refundAmount / segmentRevenue) * 100 : 0;

    return {
      segment,
      refundAmount: Number(refundAmount.toFixed(2)),
      refundRate: Number(refundRate.toFixed(2))
    };
  });

  const refundsByMonthMap = returns.reduce((acc, item) => {
    const month = monthKey(item.returnDate);
    if (!acc[month]) {
      acc[month] = { month, refundAmount: 0, refundsCount: 0 };
    }

    acc[month].refundAmount += numberValue(item.refundAmount);
    acc[month].refundsCount += 1;
    return acc;
  }, {});

  const refundsOverTime = Object.values(refundsByMonthMap)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((entry) => ({
      month: entry.month,
      refundAmount: Number(entry.refundAmount.toFixed(2)),
      refundsCount: entry.refundsCount
    }));

  const customerMixBySegment = segmentNames.map((segment) => ({
    segment,
    customers: customersBySegment[segment].length
  }));

  const heatmap = segmentNames.map((segment) => {
    const customerIds = new Set(customersBySegment[segment].map((id) => String(id)));

    const segmentOrders = orders.filter((order) => customerIds.has(String(order.customerId)));
    const segmentReturns = returns.filter((item) => customerIds.has(String(item.customerId)));
    const segmentSubs = subscriptions.filter((item) => customerIds.has(String(item.customerId)));
    const segmentTickets = tickets.filter((item) => customerIds.has(String(item.customerId)));

    const netRevenue = segmentOrders.reduce((sum, order) => sum + numberValue(order.netRevenue), 0);
    const refundAmount = segmentReturns.reduce((sum, item) => sum + numberValue(item.refundAmount), 0);
    const refundRate = netRevenue > 0 ? (refundAmount / netRevenue) * 100 : 0;
    const activeSubscriptions = segmentSubs.filter((sub) => String(sub.status).toLowerCase() === 'active').length;

    return {
      segment,
      metrics: {
        netRevenue: Number(netRevenue.toFixed(2)),
        refundAmount: Number(refundAmount.toFixed(2)),
        refundRate: Number(refundRate.toFixed(2)),
        activeSubscriptions,
        ticketCount: segmentTickets.length
      }
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    charts: {
      netRevenueBySegment,
      refundBySegment,
      refundsOverTime,
      customerMixBySegment,
      heatmap
    }
  };
}

function writeDmoAnalytics(modeledFilePath, outputFilePath) {
  const modelRaw = fs.readFileSync(modeledFilePath, 'utf8');
  const parsed = JSON.parse(modelRaw);
  const analytics = analyzeDmoEntities(parsed.entities || {});

  fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });
  fs.writeFileSync(outputFilePath, JSON.stringify(analytics, null, 2));
  return analytics;
}

module.exports = {
  analyzeDmoEntities,
  writeDmoAnalytics
};
