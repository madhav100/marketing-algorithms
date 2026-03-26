// Safety: only governed/curated outputs are returned to admin consumers.
function createGovernedDataService(getGovernedOutput) {
  return {
    getProductPerformance() {
      return getGovernedOutput('products.performance');
    },
    getCustomerSegments() {
      return getGovernedOutput('customers.segments');
    },
    getDashboardSummary() {
      return getGovernedOutput('dashboard.summary');
    },
  };
}

module.exports = { createGovernedDataService };
