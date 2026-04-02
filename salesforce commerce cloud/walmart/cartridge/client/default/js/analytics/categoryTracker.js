(function () {
  function trackCategoryClick(categoryId, categoryName) {
    const sessionId = window.SfraAnalyticsSession && window.SfraAnalyticsSession.getSessionId();
    const isSignedIn = window.SfraAnalyticsSession && window.SfraAnalyticsSession.isSignedIn && window.SfraAnalyticsSession.isSignedIn();
    const customerId = window.SfraAnalyticsSession && window.SfraAnalyticsSession.getCurrentCustomerId && window.SfraAnalyticsSession.getCurrentCustomerId();
    if (!sessionId || !isSignedIn || !customerId || customerId === 'guest') return;

    fetch('/analytics/category-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, customerId, categoryId, categoryName, timestamp: new Date().toISOString() }),
    });
  }

  window.SfraCategoryTracker = { trackCategoryClick };
})();
