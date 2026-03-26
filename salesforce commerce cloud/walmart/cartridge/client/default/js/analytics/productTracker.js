(function () {
  function trackProductClick(productId, productName, sourcePage, sourceSection) {
    const sessionId = window.SfraAnalyticsSession && window.SfraAnalyticsSession.getSessionId();
    if (!sessionId) return;

    fetch('/analytics/product-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        customerId: 'guest',
        productId,
        productName,
        sourcePage,
        sourceSection,
        timestamp: new Date().toISOString(),
      }),
    });
  }

  window.SfraProductTracker = { trackProductClick };
})();
