(function () {
  const STORAGE_KEY = 'sfra_session_id';

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
  post('/analytics/session/start', { sessionId, customerId: 'guest' });

  window.SfraAnalyticsSession = {
    getSessionId,
    login(customerId) { return post('/analytics/session/login', { sessionId, customerId }); },
    logout(customerId) { return post('/analytics/session/logout', { sessionId, customerId }); },
    end(customerId) { return post('/analytics/session/end', { sessionId, customerId: customerId || 'guest' }); },
  };

  window.addEventListener('beforeunload', () => {
    navigator.sendBeacon('/analytics/session/end', JSON.stringify({ sessionId, customerId: 'guest' }));
  });
})();
