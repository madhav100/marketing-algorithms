(function () {
  function trackProductClick(productId, productName, sourcePage, sourceSection) {
    const sessionId = window.SfraAnalyticsSession && window.SfraAnalyticsSession.getSessionId();
    const isSignedIn = window.SfraAnalyticsSession && window.SfraAnalyticsSession.isSignedIn && window.SfraAnalyticsSession.isSignedIn();
    const customerId = window.SfraAnalyticsSession && window.SfraAnalyticsSession.getCurrentCustomerId && window.SfraAnalyticsSession.getCurrentCustomerId();
    if (!sessionId || !isSignedIn || !customerId || customerId === 'guest') return;

    fetch('/analytics/product-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        customerId,
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
