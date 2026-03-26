function createUserSession({ sessionId, customerId = 'guest', isLoggedIn = false, startedAt }) {
  return {
    sessionId,
    customerId,
    isLoggedIn,
    startedAt,
    endedAt: null,
    status: 'active',
    categoryClickCount: 0,
    productClickCount: 0,
    addToCartCount: 0,
    cartItemCount: 0,
    cartValue: 0,
    cartAbandoned: false,
    hasPurchase: false,
    lastCartUpdateAt: null,
    lastActivityAt: startedAt,
    lastLoginAt: isLoggedIn ? startedAt : null,
    loggedInMinutes: 0,
    sessionDurationMinutes: 0,
  };
}

module.exports = { createUserSession };
