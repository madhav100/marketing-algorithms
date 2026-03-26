function createGovernedDataRoutes(controller) {
  return {
    'GET /api/governed/products/performance': controller.productsPerformance,
    'GET /api/governed/customers/segments': controller.customerSegments,
    'GET /api/governed/dashboard/summary': controller.dashboardSummary,
  };
}

module.exports = { createGovernedDataRoutes };
