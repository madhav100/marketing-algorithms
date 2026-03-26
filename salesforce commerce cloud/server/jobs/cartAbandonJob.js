function runCartAbandonCheck(analyticsService) {
  for (const session of analyticsService.getAllSessions()) {
    analyticsService.evaluateCartAbandonment(session.sessionId);
  }
}

module.exports = { runCartAbandonCheck };
