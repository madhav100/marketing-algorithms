function requireAdmin(req) {
  return req && req.role === 'admin';
}

module.exports = { requireAdmin };
