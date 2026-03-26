(function () {
  function trackCategoryClick(categoryId, categoryName) {
    const sessionId = window.SfraAnalyticsSession && window.SfraAnalyticsSession.getSessionId();
    if (!sessionId) return;

    fetch('/analytics/category-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, customerId: 'guest', categoryId, categoryName, timestamp: new Date().toISOString() }),
    });
  }

  window.SfraCategoryTracker = { trackCategoryClick };
})();
