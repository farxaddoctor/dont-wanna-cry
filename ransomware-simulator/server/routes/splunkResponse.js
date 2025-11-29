const express = require('express');
const router = express.Router();
const splunkResponseService = require('../services/splunkResponseService');
const logger = require('../utils/logger');

/**
 * Analyze Splunk logs for a simulation
 * POST /api/splunk-response/analyze/:simulationId
 */
router.post('/analyze/:simulationId', async (req, res) => {
  try {
    const { simulationId } = req.params;
    
    logger.info(`Analyzing Splunk logs for simulation: ${simulationId}`);
    
    const analysis = await splunkResponseService.analyzeSplunkLogs(simulationId);
    
    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    logger.error('Error analyzing Splunk logs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Isolate a host
 * POST /api/splunk-response/isolate/:hostId
 */
router.post('/isolate/:hostId', async (req, res) => {
  try {
    const { hostId } = req.params;
    const { reason, simulationId } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Reason for isolation is required'
      });
    }
    
    const result = await splunkResponseService.isolateHost(hostId, reason, simulationId);
    
    res.json(result);
  } catch (error) {
    logger.error('Error isolating host:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Recover an isolated host
 * POST /api/splunk-response/recover/:hostId
 */
router.post('/recover/:hostId', async (req, res) => {
  try {
    const { hostId } = req.params;
    
    const result = await splunkResponseService.recoverHost(hostId);
    
    res.json(result);
  } catch (error) {
    logger.error('Error recovering host:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get all isolated hosts
 * GET /api/splunk-response/isolated
 */
router.get('/isolated', async (req, res) => {
  try {
    const isolatedHosts = splunkResponseService.getIsolatedHosts();
    
    res.json({
      success: true,
      isolatedHosts,
      count: isolatedHosts.length
    });
  } catch (error) {
    logger.error('Error getting isolated hosts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get recovery queue
 * GET /api/splunk-response/recovery-queue
 */
router.get('/recovery-queue', async (req, res) => {
  try {
    const recoveryQueue = splunkResponseService.getRecoveryQueue();
    
    res.json({
      success: true,
      recoveryQueue,
      count: recoveryQueue.length
    });
  } catch (error) {
    logger.error('Error getting recovery queue:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Check if host is isolated
 * GET /api/splunk-response/status/:hostId
 */
router.get('/status/:hostId', async (req, res) => {
  try {
    const { hostId } = req.params;
    const isIsolated = splunkResponseService.isHostIsolated(hostId);
    
    res.json({
      success: true,
      hostId,
      isolated: isIsolated
    });
  } catch (error) {
    logger.error('Error checking host status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Automated response based on threat analysis
 * POST /api/splunk-response/auto-respond/:simulationId
 */
router.post('/auto-respond/:simulationId', async (req, res) => {
  try {
    const { simulationId } = req.params;
    
    // Analyze Splunk logs
    const analysis = await splunkResponseService.analyzeSplunkLogs(simulationId);
    
    const responses = [];
    
    // Take action based on threat level
    if (analysis.action === 'isolate') {
      // Isolate all affected hosts
      for (const host of analysis.affectedHosts) {
        const isolationResult = await splunkResponseService.isolateHost(
          host,
          `Automated isolation: ${analysis.threatLevel} threat detected`,
          simulationId
        );
        responses.push(isolationResult);
      }
    }
    
    res.json({
      success: true,
      analysis,
      responses,
      message: `Automated response completed: ${analysis.action}`
    });
  } catch (error) {
    logger.error('Error in automated response:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
