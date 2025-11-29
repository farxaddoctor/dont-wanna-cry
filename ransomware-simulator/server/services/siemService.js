const axios = require('axios');
const logger = require('../utils/logger');

class SIEMService {
  constructor() {
    this.type = process.env.SIEM_TYPE || 'splunk';
    this.url = process.env.SIEM_URL;
    this.apiKey = process.env.SIEM_API_KEY;
    this.index = process.env.SIEM_INDEX || 'ransomware_sim';
  }

  async sendEvent(event) {
    try {
      if (!this.url || !this.apiKey) {
        logger.warn('SIEM not configured, logging event locally:', event);
        return { success: true, message: 'Event logged locally (SIEM not configured)' };
      }

      const enrichedEvent = {
        ...event,
        timestamp: new Date().toISOString(),
        source: 'ransomware-simulator',
        index: this.index
      };

      switch (this.type) {
        case 'splunk':
          return await this.sendToSplunk(enrichedEvent);
        case 'elk':
          return await this.sendToELK(enrichedEvent);
        case 'qradar':
          return await this.sendToQRadar(enrichedEvent);
        default:
          logger.warn(`Unknown SIEM type: ${this.type}`);
          return { success: false, message: 'Unknown SIEM type' };
      }
    } catch (error) {
      logger.error('Error sending event to SIEM:', error);
      return { success: false, message: error.message };
    }
  }

  async sendToSplunk(event) {
    try {
      const response = await axios.post(
        `${this.url}/services/collector/event`,
        {
          event: event,
          sourcetype: 'ransomware_simulation',
          index: this.index
        },
        {
          headers: {
            'Authorization': `Splunk ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
        }
      );

      return { success: true, message: 'Event sent to Splunk', data: response.data };
    } catch (error) {
      logger.error('Splunk error:', error.message);
      throw error;
    }
  }

  async sendToELK(event) {
    try {
      const response = await axios.post(
        `${this.url}/${this.index}/_doc`,
        event,
        {
          headers: {
            'Authorization': `ApiKey ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return { success: true, message: 'Event sent to ELK', data: response.data };
    } catch (error) {
      logger.error('ELK error:', error.message);
      throw error;
    }
  }

  async sendToQRadar(event) {
    try {
      const response = await axios.post(
        `${this.url}/api/siem/offenses`,
        event,
        {
          headers: {
            'SEC': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return { success: true, message: 'Event sent to QRadar', data: response.data };
    } catch (error) {
      logger.error('QRadar error:', error.message);
      throw error;
    }
  }

  async queryEvents(filters = {}) {
    try {
      if (!this.url || !this.apiKey) {
        return { success: false, message: 'SIEM not configured', events: [] };
      }

      switch (this.type) {
        case 'splunk':
          return await this.queryFromSplunk(filters);
        case 'elk':
          return await this.queryFromELK(filters);
        default:
          return { success: false, message: 'Query not implemented for this SIEM type', events: [] };
      }
    } catch (error) {
      logger.error('Error querying SIEM:', error);
      return { success: false, message: error.message, events: [] };
    }
  }

  async queryFromSplunk(filters) {
    const search = filters.search || 'search index=' + this.index;
    const response = await axios.post(
      `${this.url}/services/search/jobs`,
      `search=${encodeURIComponent(search)}`,
      {
        headers: {
          'Authorization': `Splunk ${this.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
      }
    );

    return { success: true, events: response.data };
  }

  async queryFromELK(filters) {
    const response = await axios.get(
      `${this.url}/${this.index}/_search`,
      {
        headers: {
          'Authorization': `ApiKey ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        params: filters
      }
    );

    return { success: true, events: response.data.hits.hits };
  }

  async testConnection() {
    try {
      if (!this.url || !this.apiKey) {
        return { success: false, message: 'SIEM not configured' };
      }

      const testEvent = {
        eventType: 'test',
        message: 'SIEM connection test',
        timestamp: new Date().toISOString()
      };

      const result = await this.sendEvent(testEvent);
      return result;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

module.exports = new SIEMService();
