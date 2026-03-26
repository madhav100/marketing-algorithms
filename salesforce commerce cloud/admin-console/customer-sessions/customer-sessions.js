async function loadSessions() {
  const sessions = await fetch('/admin/api/customer-sessions').then((r) => r.json());
  const tbody = document.querySelector('#sessionsTable tbody');
  tbody.innerHTML = '';

  const metrics = {
    active: sessions.filter((s) => s.status === 'active').length,
    loggedIn: sessions.filter((s) => s.isLoggedIn).length,
    withCart: sessions.filter((s) => s.addToCartCount > 0).length,
    abandoned: sessions.filter((s) => s.cartAbandoned).length,
  };

  document.querySelector('#cards').innerHTML = `
    <div class="card">Active Sessions: ${metrics.active}</div>
    <div class="card">Logged In Sessions: ${metrics.loggedIn}</div>
    <div class="card">Sessions With Add to Cart: ${metrics.withCart}</div>
    <div class="card">Abandoned Carts: ${metrics.abandoned}</div>
  `;

  sessions.forEach((s) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s.sessionId}</td><td>${s.customerId}</td><td>${s.isLoggedIn}</td><td>${s.startedAt || ''}</td><td>${s.endedAt || ''}</td>
      <td>${s.categoryClickCount}</td><td>${s.productClickCount}</td><td>${s.addToCartCount}</td><td>${s.cartValue}</td><td>${s.loggedInMinutes || 0}</td><td>${s.cartAbandoned}</td><td>${s.lastActivityAt}</td>
    `;
    tr.addEventListener('click', async () => {
      const details = await fetch(`/admin/api/customer-sessions/${s.sessionId}`).then((r) => r.json());
      document.querySelector('#timeline').textContent = JSON.stringify(details, null, 2);
    });
    tbody.appendChild(tr);
  });
}

loadSessions();
