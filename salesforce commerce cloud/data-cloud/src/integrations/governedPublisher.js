function createGovernedPublisher(db) {
  return function getGovernedOutput(key) {
    const latestInsight = db.insightSnapshots[db.insightSnapshots.length - 1] || {
      totalEvents: 0,
      totalProfiles: 0,
      totalOrders: 0,
      grossMerchandiseValue: 0,
    };

    const outputs = {
      'products.performance': {
        topProducts: db.modelObjects
          .filter((m) => m.attributes.sku)
          .slice(-10)
          .map((m) => ({ sku: m.attributes.sku, orderValue: m.attributes.orderValue })),
      },
      'customers.segments': {
        segments: [
          { name: 'Active Buyers', count: latestInsight.totalProfiles },
          { name: 'High Value', count: db.modelObjects.filter((m) => Number(m.attributes.orderValue) > 100).length },
        ],
      },
      'dashboard.summary': {
        totalEvents: latestInsight.totalEvents,
        totalProfiles: latestInsight.totalProfiles,
        totalOrders: latestInsight.totalOrders,
        grossMerchandiseValue: latestInsight.grossMerchandiseValue,
        piiExposed: false,
      },
    };

    return outputs[key] || { error: 'Unknown governed output' };
  };
}

module.exports = { createGovernedPublisher };
