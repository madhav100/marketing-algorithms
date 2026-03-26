function createGovernedOutputRoutes(controller) {
  return {
    'GET /internal/governed/products/performance': controller.productsPerformance,
    'GET /internal/governed/customers/segments': controller.customerSegments,
    'GET /internal/governed/dashboard/summary': controller.dashboardSummary,
  };
}

module.exports = { createGovernedOutputRoutes };
