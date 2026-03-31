(function () {
  function trackAddToCart(productId, productName, quantity, price) {
    const sessionId = window.SfraAnalyticsSession && window.SfraAnalyticsSession.getSessionId();
    const isSignedIn = window.SfraAnalyticsSession && window.SfraAnalyticsSession.isSignedIn && window.SfraAnalyticsSession.isSignedIn();
    const customerId = window.SfraAnalyticsSession && window.SfraAnalyticsSession.getCurrentCustomerId && window.SfraAnalyticsSession.getCurrentCustomerId();
    if (!sessionId || !isSignedIn || !customerId || customerId === 'guest') return;

    fetch('/analytics/add-to-cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        customerId,
        productId,
        productName,
        quantity,
        price,
        timestamp: new Date().toISOString(),
      }),
    });
  }

  window.SfraCartTracker = { trackAddToCart };
})();
