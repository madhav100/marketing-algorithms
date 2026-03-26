function createGovernedDataController(governedDataService) {
  return {
    productsPerformance() { return governedDataService.getProductPerformance(); },
    customerSegments() { return governedDataService.getCustomerSegments(); },
    dashboardSummary() { return governedDataService.getDashboardSummary(); },
  };
}

module.exports = { createGovernedDataController };
