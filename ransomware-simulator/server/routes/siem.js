const express = require('express');
const router = express.Router();
const siemService = require('../services/siemService');
const logger = require('../utils/logger');

// Test SIEM connection
router.post('/test', async (req, res) => {
  try {
    const result = await siemService.testConnection();
    res.json(result);
  } catch (error) {
    logger.error('Error testing SIEM connection:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send event to SIEM
router.post('/events', async (req, res) => {
  try {
    const result = await siemService.sendEvent(req.body);
    res.json(result);
  } catch (error) {
    logger.error('Error sending event to SIEM:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Query events from SIEM
router.get('/events', async (req, res) => {
  try {
    const result = await siemService.queryEvents(req.query);
    res.json(result);
  } catch (error) {
    logger.error('Error querying SIEM events:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
