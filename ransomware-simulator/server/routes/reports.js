const express = require('express');
const router = express.Router();
const aiReportService = require('../services/aiReportService');
const simulationService = require('../services/simulationService');
const logger = require('../utils/logger');

// Generate AI report for a simulation
router.post('/generate/:simulationId', async (req, res) => {
  try {
    const simulation = simulationService.getSimulation(req.params.simulationId);
    
    if (!simulation) {
      return res.status(404).json({ success: false, error: 'Simulation not found' });
    }

    if (simulation.status === 'pending' || simulation.status === 'running') {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot generate report for simulation that is not completed' 
      });
    }

    logger.info(`Generating AI report for simulation: ${req.params.simulationId}`);
    
    const report = await aiReportService.generateSimulationReport(simulation);
    
    res.json({ success: true, report });
  } catch (error) {
    logger.error('Error generating report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get report by simulation ID (if cached)
router.get('/:simulationId', async (req, res) => {
  try {
    const simulation = simulationService.getSimulation(req.params.simulationId);
    
    if (!simulation) {
      return res.status(404).json({ success: false, error: 'Simulation not found' });
    }

    // Check if report is cached on simulation
    if (simulation.report) {
      return res.json({ success: true, report: simulation.report });
    }

    // Generate new report
    const report = await aiReportService.generateSimulationReport(simulation);
    
    // Cache it
    simulation.report = report;
    
    res.json({ success: true, report });
  } catch (error) {
    logger.error('Error fetching report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
