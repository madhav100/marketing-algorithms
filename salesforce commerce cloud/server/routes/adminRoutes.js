const express = require('express');
const path = require('path');

const router = express.Router();

// Admin console route.
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../admin-console/admin-console-panel/admin.html'));
});

module.exports = router;
