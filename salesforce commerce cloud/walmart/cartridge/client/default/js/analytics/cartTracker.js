(function () {
  function trackAddToCart(productId, productName, quantity, price) {
    const sessionId = window.SfraAnalyticsSession && window.SfraAnalyticsSession.getSessionId();
    if (!sessionId) return;

    fetch('/analytics/add-to-cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        customerId: 'guest',
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
