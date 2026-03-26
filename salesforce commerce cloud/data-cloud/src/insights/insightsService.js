function calculateInsights(db) {
  const totalEvents = db.streamEvents.length;
  const totalProfiles = db.identities.size;
  const orders = db.modelObjects.filter((m) => m.objectType === 'OrderEvent');
  const grossMerchandiseValue = orders.reduce((sum, order) => sum + Number(order.attributes.orderValue || 0), 0);

  const snapshot = {
    calculatedAt: new Date().toISOString(),
    totalEvents,
    totalProfiles,
    totalOrders: orders.length,
    grossMerchandiseValue,
  };

  db.addInsight(snapshot);
  return snapshot;
}

module.exports = { calculateInsights };
