const express = require('express');
const router = express.Router();
const adService = require('../services/adService');
const logger = require('../utils/logger');

// Get all hosts
router.get('/', async (req, res) => {
  try {
    const hosts = await adService.getAllHosts();
    res.json({ success: true, hosts });
  } catch (error) {
    logger.error('Error fetching hosts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get host by ID
router.get('/:id', async (req, res) => {
  try {
    const host = await adService.getHostById(req.params.id);
    if (!host) {
      return res.status(404).json({ success: false, error: 'Host not found' });
    }
    res.json({ success: true, host });
  } catch (error) {
    logger.error('Error fetching host:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get hosts by OU
router.get('/ou/:ou', async (req, res) => {
  try {
    const hosts = await adService.getHostsByOU(req.params.ou);
    res.json({ success: true, hosts });
  } catch (error) {
    logger.error('Error fetching hosts by OU:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test AD connection
router.get('/test/connection', async (req, res) => {
  try {
    const result = await adService.testConnection();
    res.json(result);
  } catch (error) {
    logger.error('Error testing AD connection:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
