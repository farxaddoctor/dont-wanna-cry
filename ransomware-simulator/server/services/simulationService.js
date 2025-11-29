const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const siemService = require('./siemService');
const malwareService = require('./malwareService');
const adService = require('./adService');

class SimulationService {
  constructor() {
    this.simulations = new Map();
    this.maxConcurrent = parseInt(process.env.MAX_CONCURRENT_SIMULATIONS) || 5;
  }

  async createSimulation(config) {
    try {
      // Validate configuration
      if (!config.targetHosts || config.targetHosts.length === 0) {
        throw new Error('No target hosts specified');
      }

      if (!config.malwareId) {
        throw new Error('No malware type specified');
      }

      // Check concurrent simulations limit
      const runningSimulations = Array.from(this.simulations.values())
        .filter(s => s.status === 'running').length;

      if (runningSimulations >= this.maxConcurrent) {
        throw new Error(`Maximum concurrent simulations (${this.maxConcurrent}) reached`);
      }

      // Get malware details
      const malware = await malwareService.getMalwareById(config.malwareId);
      if (!malware) {
        throw new Error('Invalid malware type');
      }

      // Validate hosts
      const hosts = await Promise.all(
        config.targetHosts.map(hostId => adService.getHostById(hostId))
      );

      if (hosts.some(h => !h)) {
        throw new Error('One or more invalid host IDs');
      }

      // Create simulation
      const simulation = {
        id: uuidv4(),
        malware: malware,
        targetHosts: hosts,
        config: {
          dryRun: config.dryRun !== false, // Default to dry run
          duration: config.duration || 300, // seconds
          intensity: config.intensity || 'medium',
          autoRevert: config.autoRevert !== false,
          notifyOnComplete: config.notifyOnComplete !== false
        },
        status: 'pending',
        progress: 0,
        startTime: null,
        endTime: null,
        results: [],
        events: [],
        createdAt: new Date().toISOString(),
        createdBy: config.userId || 'system'
      };

      this.simulations.set(simulation.id, simulation);

      // Log to SIEM
      await siemService.sendEvent({
        eventType: 'simulation_created',
        simulationId: simulation.id,
        malware: malware.name,
        targetHosts: hosts.map(h => h.hostname),
        config: simulation.config
      });

      logger.info(`Simulation created: ${simulation.id}`);
      return simulation;
    } catch (error) {
      logger.error('Error creating simulation:', error);
      throw error;
    }
  }

  async startSimulation(simulationId) {
    try {
      const simulation = this.simulations.get(simulationId);
      if (!simulation) {
        throw new Error('Simulation not found');
      }

      if (simulation.status !== 'pending') {
        throw new Error(`Cannot start simulation in ${simulation.status} state`);
      }

      simulation.status = 'running';
      simulation.startTime = new Date().toISOString();

      // Log to SIEM
      await siemService.sendEvent({
        eventType: 'simulation_started',
        simulationId: simulation.id,
        malware: simulation.malware.name,
        targetHosts: simulation.targetHosts.map(h => h.hostname)
      });

      // Execute simulation asynchronously
      this.executeSimulation(simulation);

      logger.info(`Simulation started: ${simulationId}`);
      return simulation;
    } catch (error) {
      logger.error('Error starting simulation:', error);
      throw error;
    }
  }

  async executeSimulation(simulation) {
    try {
      const steps = this.generateSimulationSteps(simulation);
      const totalSteps = steps.length;

      for (let i = 0; i < steps.length; i++) {
        if (simulation.status === 'stopped') {
          break;
        }

        const step = steps[i];
        await this.executeStep(simulation, step);
        
        simulation.progress = Math.round(((i + 1) / totalSteps) * 100);
        
        // Wait between steps
        await this.sleep(step.delay || 1000);
      }

      if (simulation.status === 'running') {
        simulation.status = 'completed';
        simulation.endTime = new Date().toISOString();

        // Auto-revert if enabled
        if (simulation.config.autoRevert) {
          await this.revertSimulation(simulation.id);
        }

        // Log completion to SIEM
        await siemService.sendEvent({
          eventType: 'simulation_completed',
          simulationId: simulation.id,
          duration: new Date(simulation.endTime) - new Date(simulation.startTime),
          results: simulation.results
        });

        logger.info(`Simulation completed: ${simulation.id}`);
      }
    } catch (error) {
      simulation.status = 'failed';
      simulation.error = error.message;
      logger.error(`Simulation failed: ${simulation.id}`, error);

      await siemService.sendEvent({
        eventType: 'simulation_failed',
        simulationId: simulation.id,
        error: error.message
      });
    }
  }

  generateSimulationSteps(simulation) {
    const steps = [];
    const behaviors = simulation.malware.behaviors;

    simulation.targetHosts.forEach(host => {
      // Initial reconnaissance
      steps.push({
        type: 'reconnaissance',
        host: host,
        action: 'System enumeration',
        description: `Enumerating system information on ${host.hostname}`,
        delay: 2000
      });

      // Execute each behavior
      behaviors.forEach(behavior => {
        steps.push({
          type: 'behavior',
          host: host,
          action: behavior,
          description: `Executing: ${behavior} on ${host.hostname}`,
          delay: 3000
        });
      });

      // File operations
      if (simulation.malware.targetExtensions) {
        steps.push({
          type: 'file_operation',
          host: host,
          action: 'File enumeration',
          description: `Scanning for target files on ${host.hostname}`,
          extensions: simulation.malware.targetExtensions,
          delay: 2000
        });

        if (!simulation.config.dryRun) {
          steps.push({
            type: 'file_operation',
            host: host,
            action: 'File encryption simulation',
            description: `Simulating encryption on ${host.hostname}`,
            delay: 5000
          });
        }
      }

      // Ransom note
      steps.push({
        type: 'artifact',
        host: host,
        action: 'Ransom note creation',
        description: `Creating ransom note on ${host.hostname}`,
        delay: 1000
      });
    });

    return steps;
  }

  async executeStep(simulation, step) {
    try {
      const event = {
        simulationId: simulation.id,
        timestamp: new Date().toISOString(),
        host: step.host.hostname,
        type: step.type,
        action: step.action,
        description: step.description,
        dryRun: simulation.config.dryRun
      };

      // Add to simulation events
      simulation.events.push(event);

      // Log to SIEM
      await siemService.sendEvent({
        eventType: 'simulation_step',
        ...event
      });

      // Simulate the action
      const result = {
        step: step.action,
        host: step.host.hostname,
        success: true,
        timestamp: new Date().toISOString(),
        details: this.simulateStepExecution(step, simulation.config.dryRun)
      };

      simulation.results.push(result);

      logger.debug(`Executed step: ${step.action} on ${step.host.hostname}`);
    } catch (error) {
      logger.error('Error executing step:', error);
      simulation.results.push({
        step: step.action,
        host: step.host.hostname,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  simulateStepExecution(step, dryRun) {
    // Simulate different types of operations
    switch (step.type) {
      case 'reconnaissance':
        return {
          os: step.host.os,
          processes: Math.floor(Math.random() * 100) + 50,
          services: Math.floor(Math.random() * 50) + 20
        };
      
      case 'file_operation':
        return {
          filesScanned: Math.floor(Math.random() * 1000) + 100,
          filesAffected: dryRun ? 0 : Math.floor(Math.random() * 50) + 10,
          extensions: step.extensions
        };
      
      case 'behavior':
        return {
          executed: !dryRun,
          impact: dryRun ? 'none' : 'simulated'
        };
      
      case 'artifact':
        return {
          created: !dryRun,
          path: 'C:\\Users\\Public\\README_RANSOM.txt'
        };
      
      default:
        return { executed: true };
    }
  }

  async stopSimulation(simulationId) {
    const simulation = this.simulations.get(simulationId);
    if (!simulation) {
      throw new Error('Simulation not found');
    }

    if (simulation.status !== 'running') {
      throw new Error(`Cannot stop simulation in ${simulation.status} state`);
    }

    simulation.status = 'stopped';
    simulation.endTime = new Date().toISOString();

    await siemService.sendEvent({
      eventType: 'simulation_stopped',
      simulationId: simulation.id,
      stoppedAt: simulation.endTime
    });

    logger.info(`Simulation stopped: ${simulationId}`);
    return simulation;
  }

  async revertSimulation(simulationId) {
    const simulation = this.simulations.get(simulationId);
    if (!simulation) {
      throw new Error('Simulation not found');
    }

    logger.info(`Reverting simulation: ${simulationId}`);

    // Simulate cleanup operations
    simulation.targetHosts.forEach(host => {
      simulation.events.push({
        type: 'cleanup',
        host: host.hostname,
        action: 'Reverting changes',
        timestamp: new Date().toISOString()
      });
    });

    await siemService.sendEvent({
      eventType: 'simulation_reverted',
      simulationId: simulation.id
    });

    return { success: true, message: 'Simulation reverted successfully' };
  }

  getSimulation(simulationId) {
    return this.simulations.get(simulationId);
  }

  getAllSimulations() {
    return Array.from(this.simulations.values()).sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  getSimulationsByStatus(status) {
    return this.getAllSimulations().filter(s => s.status === status);
  }

  async deleteSimulation(simulationId) {
    const simulation = this.simulations.get(simulationId);
    if (!simulation) {
      throw new Error('Simulation not found');
    }

    if (simulation.status === 'running') {
      throw new Error('Cannot delete running simulation');
    }

    this.simulations.delete(simulationId);
    logger.info(`Simulation deleted: ${simulationId}`);
    return { success: true };
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new SimulationService();
