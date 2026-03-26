function createGovernedOutputController(getGovernedOutput) {
  return {
    productsPerformance() {
      return getGovernedOutput('products.performance');
    },
    customerSegments() {
      return getGovernedOutput('customers.segments');
    },
    dashboardSummary() {
      return getGovernedOutput('dashboard.summary');
    },
  };
}

module.exports = { createGovernedOutputController };
