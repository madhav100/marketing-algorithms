function createIngestionRoutes(controller) {
  return {
    // Internal-only routes. Must not be exposed to storefront/admin frontends.
    'POST /internal/ingestion/events': controller.ingestEvent,
    'POST /internal/ingestion/db-sync': controller.ingestDbSync,
  };
}

module.exports = { createIngestionRoutes };
