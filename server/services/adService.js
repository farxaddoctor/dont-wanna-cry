const ActiveDirectory = require('activedirectory2');
const logger = require('../utils/logger');

class ADService {
  constructor() {
    this.config = {
      url: process.env.AD_URL,
      baseDN: process.env.AD_BASE_DN,
      username: process.env.AD_USERNAME,
      password: process.env.AD_PASSWORD
    };
    
    this.ad = null;
    this.initializeConnection();
  }

  initializeConnection() {
    try {
      if (this.config.url && this.config.username && this.config.password) {
        this.ad = new ActiveDirectory(this.config);
        logger.info('Active Directory connection initialized');
      } else {
        logger.warn('AD credentials not configured, using mock data');
      }
    } catch (error) {
      logger.error('Failed to initialize AD connection:', error);
    }
  }

  async getAllHosts() {
    try {
      if (!this.ad) {
        return this.getMockHosts();
      }

      return new Promise((resolve, reject) => {
        // Filter by specific OUs if needed (uncomment and modify)
        // const query = '(&(objectClass=computer)(objectCategory=computer)(|(ou=Workstations)(ou=Servers)))';
        const query = '(&(objectClass=computer)(objectCategory=computer))';
        this.ad.findUsers(query, (err, results) => {
          if (err) {
            logger.error('AD query error:', err);
            resolve(this.getMockHosts());
            return;
          }

          const hosts = results.map(computer => ({
            id: computer.objectGUID,
            name: computer.cn,
            hostname: computer.dNSHostName,
            os: computer.operatingSystem,
            osVersion: computer.operatingSystemVersion,
            lastLogon: computer.lastLogonTimestamp,
            distinguishedName: computer.dn,
            status: 'online',
            ipAddress: computer.ipAddress || 'N/A',
            department: this.extractOU(computer.dn)
          }));

          resolve(hosts);
        });
      });
    } catch (error) {
      logger.error('Error fetching hosts from AD:', error);
      return this.getMockHosts();
    }
  }

  async getHostById(id) {
    const hosts = await this.getAllHosts();
    return hosts.find(host => host.id === id);
  }

  async getHostsByOU(ou) {
    const hosts = await this.getAllHosts();
    return hosts.filter(host => host.department === ou);
  }

  extractOU(dn) {
    const match = dn.match(/OU=([^,]+)/);
    return match ? match[1] : 'Unknown';
  }

  getMockHosts() {
    // Mock data for development/testing
    return [
      {
        id: '1',
        name: 'WS-FINANCE-01',
        hostname: 'ws-finance-01.ransomrun.local',
        os: 'Windows 10 Enterprise',
        osVersion: '10.0.19045',
        lastLogon: new Date().toISOString(),
        distinguishedName: 'CN=WS-FINANCE-01,OU=Finance,DC=ransomrun,DC=local',
        status: 'online',
        ipAddress: '192.168.1.101',
        department: 'Finance'
      },
      {
        id: '2',
        name: 'WS-HR-01',
        hostname: 'ws-hr-01.ransomrun.local',
        os: 'Windows 11 Enterprise',
        osVersion: '10.0.22621',
        lastLogon: new Date().toISOString(),
        distinguishedName: 'CN=WS-HR-01,OU=HR,DC=ransomrun,DC=local',
        status: 'online',
        ipAddress: '192.168.1.102',
        department: 'HR'
      },
      {
        id: '3',
        name: 'WS-IT-01',
        hostname: 'ws-it-01.ransomrun.local',
        os: 'Windows 11 Enterprise',
        osVersion: '10.0.22621',
        lastLogon: new Date().toISOString(),
        distinguishedName: 'CN=WS-IT-01,OU=IT,DC=ransomrun,DC=local',
        status: 'online',
        ipAddress: '192.168.1.103',
        department: 'IT'
      },
      {
        id: '4',
        name: 'SRV-FILE-01',
        hostname: 'srv-file-01.ransomrun.local',
        os: 'Windows Server 2022',
        osVersion: '10.0.20348',
        lastLogon: new Date().toISOString(),
        distinguishedName: 'CN=SRV-FILE-01,OU=Servers,DC=ransomrun,DC=local',
        status: 'online',
        ipAddress: '192.168.1.10',
        department: 'Servers'
      },
      {
        id: '5',
        name: 'WS-SALES-01',
        hostname: 'ws-sales-01.ransomrun.local',
        os: 'Windows 10 Enterprise',
        osVersion: '10.0.19045',
        lastLogon: new Date(Date.now() - 86400000).toISOString(),
        distinguishedName: 'CN=WS-SALES-01,OU=Sales,DC=ransomrun,DC=local',
        status: 'offline',
        ipAddress: '192.168.1.104',
        department: 'Sales'
      }
    ];
  }

  async testConnection() {
    try {
      if (!this.ad) {
        return { success: false, message: 'AD not configured, using mock data' };
      }

      return new Promise((resolve) => {
        this.ad.authenticate(this.config.username, this.config.password, (err, auth) => {
          if (err) {
            resolve({ success: false, message: err.message });
            return;
          }
          resolve({ success: auth, message: auth ? 'Connected' : 'Authentication failed' });
        });
      });
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

module.exports = new ADService();
