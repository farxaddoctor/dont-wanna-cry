const express = require('express');
const router = express.Router();
const simulationService = require('../services/simulationService');
const logger = require('../utils/logger');

// Get all simulations
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const simulations = status 
      ? simulationService.getSimulationsByStatus(status)
      : simulationService.getAllSimulations();
    res.json({ success: true, simulations });
  } catch (error) {
    logger.error('Error fetching simulations:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get simulation by ID
router.get('/:id', async (req, res) => {
  try {
    const simulation = simulationService.getSimulation(req.params.id);
    if (!simulation) {
      return res.status(404).json({ success: false, error: 'Simulation not found' });
    }
    res.json({ success: true, simulation });
  } catch (error) {
    logger.error('Error fetching simulation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new simulation
router.post('/', async (req, res) => {
  try {
    const simulation = await simulationService.createSimulation(req.body);
    res.status(201).json({ success: true, simulation });
  } catch (error) {
    logger.error('Error creating simulation:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Start simulation
router.post('/:id/start', async (req, res) => {
  try {
    const simulation = await simulationService.startSimulation(req.params.id);
    res.json({ success: true, simulation });
  } catch (error) {
    logger.error('Error starting simulation:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Stop simulation
router.post('/:id/stop', async (req, res) => {
  try {
    const simulation = await simulationService.stopSimulation(req.params.id);
    res.json({ success: true, simulation });
  } catch (error) {
    logger.error('Error stopping simulation:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Revert simulation
router.post('/:id/revert', async (req, res) => {
  try {
    const result = await simulationService.revertSimulation(req.params.id);
    res.json(result);
  } catch (error) {
    logger.error('Error reverting simulation:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete simulation
router.delete('/:id', async (req, res) => {
  try {
    const result = await simulationService.deleteSimulation(req.params.id);
    res.json(result);
  } catch (error) {
    logger.error('Error deleting simulation:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
