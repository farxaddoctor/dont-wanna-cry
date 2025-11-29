import React, { useState } from 'react';
import axios from 'axios';
import { 
  Database, 
  Shield, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  AlertTriangle 
} from 'lucide-react';

const Settings = () => {
  const [adStatus, setAdStatus] = useState(null);
  const [siemStatus, setSiemStatus] = useState(null);
  const [testing, setTesting] = useState({ ad: false, siem: false });

  const testADConnection = async () => {
    setTesting({ ...testing, ad: true });
    try {
      const response = await axios.get('/api/hosts/test/connection');
      setAdStatus(response.data);
    } catch (error) {
      setAdStatus({ success: false, message: error.message });
    } finally {
      setTesting({ ...testing, ad: false });
    }
  };

  const testSIEMConnection = async () => {
    setTesting({ ...testing, siem: true });
    try {
      const response = await axios.post('/api/siem/test');
      setSiemStatus(response.data);
    } catch (error) {
      setSiemStatus({ success: false, message: error.message });
    } finally {
      setTesting({ ...testing, siem: false });
    }
  };

  const ConnectionStatus = ({ status, name }) => {
    if (!status) return null;

    return (
      <div className={`mt-4 p-4 rounded-lg border ${
        status.success 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-start">
          {status.success ? (
            <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className={`font-medium ${
              status.success ? 'text-green-900' : 'text-red-900'
            }`}>
              {status.success ? `${name} Connected` : `${name} Connection Failed`}
            </p>
            <p className={`text-sm mt-1 ${
              status.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {status.message}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure integrations and system settings</p>
      </div>

      {/* Active Directory Settings */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Database className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Active Directory</h3>
              <p className="text-sm text-gray-600">Configure AD connection for host discovery</p>
            </div>
          </div>
          <button
            onClick={testADConnection}
            disabled={testing.ad}
            className="btn btn-primary flex items-center"
          >
            {testing.ad ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Test Connection
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LDAP URL
            </label>
            <input
              type="text"
              placeholder="ldap://dc.company.local:389"
              className="input"
              defaultValue={process.env.AD_URL || ''}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base DN
            </label>
            <input
              type="text"
              placeholder="DC=company,DC=local"
              className="input"
              defaultValue={process.env.AD_BASE_DN || ''}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              placeholder="admin@company.local"
              className="input"
              defaultValue={process.env.AD_USERNAME || ''}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="input"
            />
          </div>
        </div>

        <ConnectionStatus status={adStatus} name="Active Directory" />

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Configure these settings in the <code className="bg-blue-100 px-1 rounded">.env</code> file on the server.
          </p>
        </div>
      </div>

      {/* SIEM Settings */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Shield className="w-6 h-6 text-purple-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">SIEM Integration</h3>
              <p className="text-sm text-gray-600">Configure SIEM connection for event logging</p>
            </div>
          </div>
          <button
            onClick={testSIEMConnection}
            disabled={testing.siem}
            className="btn btn-primary flex items-center"
          >
            {testing.siem ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Test Connection
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SIEM Type
            </label>
            <select className="input" defaultValue="splunk">
              <option value="splunk">Splunk</option>
              <option value="elk">ELK Stack</option>
              <option value="qradar">QRadar</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SIEM URL
            </label>
            <input
              type="text"
              placeholder="https://splunk.company.local:8089"
              className="input"
              defaultValue={process.env.SIEM_URL || ''}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key / Token
            </label>
            <input
              type="password"
              placeholder="••••••••••••••••"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Index Name
            </label>
            <input
              type="text"
              placeholder="ransomware_sim"
              className="input"
              defaultValue="ransomware_sim"
            />
          </div>
        </div>

        <ConnectionStatus status={siemStatus} name="SIEM" />

        <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-800">
            <strong>Note:</strong> Configure these settings in the <code className="bg-purple-100 px-1 rounded">.env</code> file on the server.
          </p>
        </div>
      </div>

      {/* Simulation Settings */}
      <div className="card">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-6 h-6 text-orange-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Simulation Settings</h3>
            <p className="text-sm text-gray-600">Configure default simulation parameters</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Concurrent Simulations
            </label>
            <input
              type="number"
              className="input"
              defaultValue="5"
              min="1"
              max="10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Timeout (seconds)
            </label>
            <input
              type="number"
              className="input"
              defaultValue="300"
              min="60"
              max="3600"
            />
          </div>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-900">Safety Reminder</p>
              <p className="text-sm text-yellow-800 mt-1">
                Always run simulations in isolated test environments. Never use this tool on production systems without proper authorization and safeguards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
