(function () {
  const STORAGE_KEY = 'sfra_session_id';


  function getCurrentCustomerId() {
    try {
      const customer = JSON.parse(window.localStorage.getItem('wmCurrentCustomer') || 'null');
      return customer && customer.id ? customer.id : 'guest';
    } catch (error) {
      return 'guest';
    }
  }

  function getSessionId() {
    let sessionId = localStorage.getItem(STORAGE_KEY);
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
      localStorage.setItem(STORAGE_KEY, sessionId);
    }
    return sessionId;
  }

  function post(path, payload) {
    return fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  }

  const sessionId = getSessionId();
  const currentCustomerId = getCurrentCustomerId();
  if (currentCustomerId !== 'guest') {
    post('/analytics/session/start', { sessionId, customerId: currentCustomerId, isLoggedIn: true });
  }

  window.SfraAnalyticsSession = {
    getSessionId,
    getCurrentCustomerId,
    isSignedIn() { return getCurrentCustomerId() !== 'guest'; },
    login(customerId) {
      const resolvedCustomerId = customerId || getCurrentCustomerId();
      if (resolvedCustomerId === 'guest') return Promise.resolve();
      return post('/analytics/session/login', { sessionId, customerId: resolvedCustomerId });
    },
    logout(customerId) {
      const resolvedCustomerId = customerId || getCurrentCustomerId();
      if (resolvedCustomerId === 'guest') return Promise.resolve();
      return post('/analytics/session/logout', { sessionId, customerId: resolvedCustomerId });
    },
    end(customerId) {
      const resolvedCustomerId = customerId || getCurrentCustomerId();
      localStorage.removeItem(STORAGE_KEY);
      if (resolvedCustomerId === 'guest') return Promise.resolve();
      return post('/analytics/session/end', { sessionId, customerId: resolvedCustomerId });
    },
  };

  window.addEventListener('beforeunload', () => {
    const customerId = getCurrentCustomerId();
    if (customerId === 'guest') return;
    fetch('/analytics/session/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, customerId }),
      keepalive: true,
    });
  });
})();
