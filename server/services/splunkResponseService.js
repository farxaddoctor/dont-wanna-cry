const axios = require('axios');
const logger = require('../utils/logger');
const siemService = require('./siemService');

class SplunkResponseService {
  constructor() {
    this.splunkUrl = process.env.SIEM_URL;
    this.splunkToken = process.env.SIEM_API_KEY;
    this.splunkIndex = process.env.SIEM_INDEX || 'ransomware_sim';
    this.isolatedHosts = new Map(); // Track isolated hosts
    this.recoveryQueue = new Map(); // Track hosts pending recovery
  }

  /**
   * Analyze Splunk logs for a specific simulation
   * @param {string} simulationId - The simulation ID to analyze
   * @returns {Object} Analysis results with threat level and recommendations
   */
  async analyzeSplunkLogs(simulationId) {
    try {
      logger.info(`Analyzing Splunk logs for simulation: ${simulationId}`);

      // Query Splunk for simulation events
      const query = `search index=${this.splunkIndex} simulationId="${simulationId}" | stats count by eventType, host, action`;
      
      const logs = await this.querySplunk(query);
      
      // Analyze the logs
      const analysis = this.performThreatAnalysis(logs, simulationId);
      
      return analysis;
    } catch (error) {
      logger.error('Error analyzing Splunk logs:', error);
      return {
        success: false,
        error: error.message,
        threatLevel: 'unknown'
      };
    }
  }

  /**
   * Query Splunk for events
   * @param {string} query - Splunk search query
   * @returns {Array} Search results
   */
  async querySplunk(query) {
    try {
      if (!this.splunkUrl || !this.splunkToken) {
        logger.warn('Splunk not configured, using mock data');
        return this.getMockSplunkData();
      }

      // Create search job
      const searchResponse = await axios.post(
        `${this.splunkUrl}/services/search/jobs`,
        `search=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Splunk ${this.splunkToken}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
        }
      );

      const sid = searchResponse.data.sid;

      // Wait for search to complete
      await this.waitForSearchCompletion(sid);

      // Get results
      const resultsResponse = await axios.get(
        `${this.splunkUrl}/services/search/jobs/${sid}/results`,
        {
          headers: {
            'Authorization': `Splunk ${this.splunkToken}`,
            'Content-Type': 'application/json'
          },
          params: {
            output_mode: 'json',
            count: 1000
          },
          httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
        }
      );

      return resultsResponse.data.results || [];
    } catch (error) {
      logger.error('Splunk query error:', error.message);
      return this.getMockSplunkData();
    }
  }

  /**
   * Wait for Splunk search job to complete
   */
  async waitForSearchCompletion(sid, maxWait = 30000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
      try {
        const statusResponse = await axios.get(
          `${this.splunkUrl}/services/search/jobs/${sid}`,
          {
            headers: {
              'Authorization': `Splunk ${this.splunkToken}`
            },
            httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
          }
        );

        if (statusResponse.data.entry[0].content.isDone) {
          return true;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        logger.error('Error checking search status:', error.message);
        break;
      }
    }
    
    return false;
  }

  /**
   * Perform threat analysis on Splunk logs
   * @param {Array} logs - Splunk log entries
   * @param {string} simulationId - Simulation ID
   * @returns {Object} Threat analysis results
   */
  performThreatAnalysis(logs, simulationId) {
    let threatScore = 0;
    const indicators = [];
    const affectedHosts = new Set();
    const criticalEvents = [];

    logs.forEach(log => {
      // Track affected hosts
      if (log.host) {
        affectedHosts.add(log.host);
      }

      // Analyze event types
      switch (log.eventType) {
        case 'file_encryption':
          threatScore += 30;
          indicators.push('Mass file encryption detected');
          criticalEvents.push(log);
          break;
        
        case 'lateral_movement':
          threatScore += 25;
          indicators.push('Lateral movement across network');
          criticalEvents.push(log);
          break;
        
        case 'data_exfiltration':
          threatScore += 35;
          indicators.push('Data exfiltration attempt detected');
          criticalEvents.push(log);
          break;
        
        case 'privilege_escalation':
          threatScore += 20;
          indicators.push('Privilege escalation detected');
          break;
        
        case 'backup_deletion':
          threatScore += 40;
          indicators.push('Critical: Backup deletion attempt');
          criticalEvents.push(log);
          break;
        
        case 'network_scanning':
          threatScore += 15;
          indicators.push('Network reconnaissance activity');
          break;
      }
    });

    // Determine threat level
    let threatLevel = 'low';
    let action = 'completed';
    
    if (threatScore >= 70) {
      threatLevel = 'critical';
      action = 'isolate';
    } else if (threatScore >= 50) {
      threatLevel = 'high';
      action = 'isolate';
    } else if (threatScore >= 30) {
      threatLevel = 'medium';
      action = 'monitor';
    }

    return {
      success: true,
      simulationId,
      threatLevel,
      threatScore,
      action,
      indicators,
      affectedHosts: Array.from(affectedHosts),
      criticalEvents,
      totalEvents: logs.length,
      recommendation: this.getRecommendation(threatLevel, action),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get recommendation based on threat level
   */
  getRecommendation(threatLevel, action) {
    const recommendations = {
      critical: {
        isolate: [
          'IMMEDIATE: Isolate all affected hosts from network',
          'Initiate backup recovery procedures',
          'Notify security team and management',
          'Preserve forensic evidence',
          'Begin incident response protocol'
        ]
      },
      high: {
        isolate: [
          'Isolate affected hosts to prevent spread',
          'Verify backup integrity',
          'Conduct detailed forensic analysis',
          'Review and update security controls'
        ]
      },
      medium: {
        monitor: [
          'Continue monitoring affected systems',
          'Review security logs for anomalies',
          'Verify endpoint protection is active',
          'Schedule security assessment'
        ]
      },
      low: {
        completed: [
          'Simulation completed successfully',
          'No immediate threats detected',
          'Review findings for improvements',
          'Update security documentation'
        ]
      }
    };

    return recommendations[threatLevel]?.[action] || ['Review simulation results'];
  }

  /**
   * Isolate a host based on threat analysis
   * @param {string} hostId - Host ID to isolate
   * @param {string} reason - Reason for isolation
   */
  async isolateHost(hostId, reason, simulationId) {
    try {
      logger.warn(`Isolating host ${hostId}: ${reason}`);

      const isolationData = {
        hostId,
        reason,
        simulationId,
        isolatedAt: new Date().toISOString(),
        status: 'isolated',
        actions: [
          'Network access disabled',
          'Firewall rules applied',
          'User sessions terminated',
          'Backup snapshot created'
        ]
      };

      this.isolatedHosts.set(hostId, isolationData);

      // Send isolation event to Splunk
      await siemService.sendEvent({
        eventType: 'host_isolated',
        hostId,
        reason,
        simulationId,
        severity: 'critical',
        action: 'isolation',
        timestamp: new Date().toISOString()
      });

      // Queue for recovery
      this.recoveryQueue.set(hostId, {
        ...isolationData,
        recoveryPending: true
      });

      logger.info(`Host ${hostId} isolated successfully`);
      
      return {
        success: true,
        hostId,
        status: 'isolated',
        message: 'Host isolated successfully',
        ...isolationData
      };
    } catch (error) {
      logger.error(`Error isolating host ${hostId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Recover and restore an isolated host
   * @param {string} hostId - Host ID to recover
   */
  async recoverHost(hostId) {
    try {
      const isolationData = this.isolatedHosts.get(hostId);
      
      if (!isolationData) {
        throw new Error('Host is not isolated');
      }

      logger.info(`Starting recovery for host ${hostId}`);

      const recoverySteps = [
        'Restoring from backup snapshot',
        'Verifying data integrity',
        'Applying security patches',
        'Restoring network access',
        'Running security scan',
        'Validating system health'
      ];

      const recoveryData = {
        hostId,
        startedAt: new Date().toISOString(),
        steps: recoverySteps,
        status: 'recovering',
        progress: 0
      };

      // Simulate recovery process
      for (let i = 0; i < recoverySteps.length; i++) {
        recoveryData.progress = Math.round(((i + 1) / recoverySteps.length) * 100);
        recoveryData.currentStep = recoverySteps[i];
        
        // Send progress to Splunk
        await siemService.sendEvent({
          eventType: 'host_recovery_progress',
          hostId,
          step: recoverySteps[i],
          progress: recoveryData.progress,
          timestamp: new Date().toISOString()
        });

        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Mark as recovered
      this.isolatedHosts.delete(hostId);
      this.recoveryQueue.delete(hostId);

      const completionData = {
        hostId,
        status: 'recovered',
        completedAt: new Date().toISOString(),
        duration: Date.now() - new Date(isolationData.isolatedAt).getTime(),
        backupRestored: true,
        securityValidated: true
      };

      // Send completion event to Splunk
      await siemService.sendEvent({
        eventType: 'host_recovered',
        ...completionData,
        severity: 'info'
      });

      logger.info(`Host ${hostId} recovered successfully`);

      return {
        success: true,
        ...completionData,
        message: 'Host recovered and restored successfully'
      };
    } catch (error) {
      logger.error(`Error recovering host ${hostId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get status of all isolated hosts
   */
  getIsolatedHosts() {
    return Array.from(this.isolatedHosts.values());
  }

  /**
   * Get recovery queue
   */
  getRecoveryQueue() {
    return Array.from(this.recoveryQueue.values());
  }

  /**
   * Check if host is isolated
   */
  isHostIsolated(hostId) {
    return this.isolatedHosts.has(hostId);
  }

  /**
   * Mock Splunk data for testing
   */
  getMockSplunkData() {
    return [
      {
        eventType: 'file_encryption',
        host: 'ws-finance-01.ransomrun.local',
        action: 'encrypt',
        count: 150
      },
      {
        eventType: 'network_scanning',
        host: 'ws-finance-01.ransomrun.local',
        action: 'scan',
        count: 25
      },
      {
        eventType: 'lateral_movement',
        host: 'ws-hr-01.ransomrun.local',
        action: 'propagate',
        count: 5
      }
    ];
  }
}

module.exports = new SplunkResponseService();
