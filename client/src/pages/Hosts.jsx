import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Server, Search, RefreshCw, Circle, Monitor, X, AlertTriangle, Shield, CheckCircle, XCircle } from 'lucide-react';

const Hosts = () => {
  const [hosts, setHosts] = useState([]);
  const [filteredHosts, setFilteredHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedHost, setSelectedHost] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchHosts();
  }, []);

  useEffect(() => {
    filterHosts();
  }, [searchTerm, selectedDepartment, hosts]);

  const fetchHosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/hosts');
      setHosts(response.data.hosts || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching hosts:', error);
      setLoading(false);
    }
  };

  const filterHosts = () => {
    let filtered = hosts;

    if (searchTerm) {
      filtered = filtered.filter(host =>
        host.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        host.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        host.ipAddress.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(host => host.department === selectedDepartment);
    }

    setFilteredHosts(filtered);
  };

  const departments = ['all', ...new Set(hosts.map(h => h.department))];

  // Assess ransomware vulnerability for a host
  const assessVulnerability = (host) => {
    let score = 0;
    let vulnerabilities = [];
    
    // Check OS version
    if (host.os?.includes('Windows 10') || host.os?.includes('Windows 7')) {
      score += 30;
      vulnerabilities.push('Older Windows version - higher risk');
    }
    if (host.os?.includes('Server')) {
      score += 25;
      vulnerabilities.push('Critical server infrastructure');
    }
    
    // Check department criticality
    if (['Finance', 'Servers', 'IT'].includes(host.department)) {
      score += 25;
      vulnerabilities.push('High-value target department');
    }
    
    // Check status
    if (host.status === 'offline') {
      score += 15;
      vulnerabilities.push('Offline - may have missed security updates');
    }
    
    // Check last logon (if more than 7 days, likely outdated)
    const daysSinceLogon = (Date.now() - new Date(host.lastLogon)) / (1000 * 60 * 60 * 24);
    if (daysSinceLogon > 7) {
      score += 20;
      vulnerabilities.push('Inactive system - potential patch gaps');
    }
    
    // Determine risk level
    let riskLevel = 'Low';
    let riskColor = 'green';
    if (score >= 70) {
      riskLevel = 'Critical';
      riskColor = 'red';
    } else if (score >= 50) {
      riskLevel = 'High';
      riskColor = 'orange';
    } else if (score >= 30) {
      riskLevel = 'Medium';
      riskColor = 'yellow';
    }
    
    return { score, riskLevel, riskColor, vulnerabilities };
  };

  const handleViewDetails = (host) => {
    setSelectedHost(host);
    setShowDetailsModal(true);
  };

  const closeModal = () => {
    setShowDetailsModal(false);
    setSelectedHost(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hosts</h1>
          <p className="text-gray-600 mt-1">Active Directory discovered hosts</p>
        </div>
        <button
          onClick={fetchHosts}
          className="btn btn-primary flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search hosts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="input"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hosts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHosts.map((host) => {
          const vulnerability = assessVulnerability(host);
          return (
            <div key={host.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Monitor className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{host.name}</h3>
                    <p className="text-sm text-gray-500">{host.department}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Circle
                    className={`w-3 h-3 ${
                      host.status === 'online' ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'
                    }`}
                  />
                  <span className={`ml-2 text-sm ${
                    host.status === 'online' ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {host.status}
                  </span>
                </div>
              </div>

              {/* Vulnerability Badge */}
              <div className={`mb-3 px-3 py-2 rounded-lg flex items-center justify-between ${
                vulnerability.riskColor === 'red' ? 'bg-red-50 border border-red-200' :
                vulnerability.riskColor === 'orange' ? 'bg-orange-50 border border-orange-200' :
                vulnerability.riskColor === 'yellow' ? 'bg-yellow-50 border border-yellow-200' :
                'bg-green-50 border border-green-200'
              }`}>
                <div className="flex items-center">
                  <AlertTriangle className={`w-4 h-4 mr-2 ${
                    vulnerability.riskColor === 'red' ? 'text-red-600' :
                    vulnerability.riskColor === 'orange' ? 'text-orange-600' :
                    vulnerability.riskColor === 'yellow' ? 'text-yellow-600' :
                    'text-green-600'
                  }`} />
                  <span className={`text-sm font-semibold ${
                    vulnerability.riskColor === 'red' ? 'text-red-700' :
                    vulnerability.riskColor === 'orange' ? 'text-orange-700' :
                    vulnerability.riskColor === 'yellow' ? 'text-yellow-700' :
                    'text-green-700'
                  }`}>
                    {vulnerability.riskLevel} Risk
                  </span>
                </div>
                <span className={`text-xs font-medium ${
                  vulnerability.riskColor === 'red' ? 'text-red-600' :
                  vulnerability.riskColor === 'orange' ? 'text-orange-600' :
                  vulnerability.riskColor === 'yellow' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  Score: {vulnerability.score}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Hostname:</span>
                  <span className="text-gray-900 font-medium">{host.hostname}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IP Address:</span>
                  <span className="text-gray-900 font-medium">{host.ipAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">OS:</span>
                  <span className="text-gray-900 font-medium">{host.os}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Logon:</span>
                  <span className="text-gray-900 font-medium">
                    {new Date(host.lastLogon).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => handleViewDetails(host)}
                  className="w-full btn btn-secondary text-sm hover:bg-gray-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredHosts.length === 0 && (
        <div className="card text-center py-12">
          <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No hosts found matching your criteria</p>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedHost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <Monitor className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedHost.name}</h2>
                  <p className="text-sm text-gray-500">{selectedHost.department} Department</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* System Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Server className="w-5 h-5 mr-2 text-blue-600" />
                  System Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Hostname</p>
                    <p className="font-semibold text-gray-900">{selectedHost.hostname}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">IP Address</p>
                    <p className="font-semibold text-gray-900">{selectedHost.ipAddress}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Operating System</p>
                    <p className="font-semibold text-gray-900">{selectedHost.os}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">OS Version</p>
                    <p className="font-semibold text-gray-900">{selectedHost.osVersion}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <div className="flex items-center">
                      <Circle className={`w-3 h-3 mr-2 ${
                        selectedHost.status === 'online' ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'
                      }`} />
                      <p className="font-semibold text-gray-900 capitalize">{selectedHost.status}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Last Logon</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedHost.lastLogon).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ransomware Vulnerability Assessment */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-red-600" />
                  Ransomware Vulnerability Assessment
                </h3>
                
                {(() => {
                  const vuln = assessVulnerability(selectedHost);
                  return (
                    <>
                      {/* Risk Score Card */}
                      <div className={`p-6 rounded-lg mb-4 ${
                        vuln.riskColor === 'red' ? 'bg-red-50 border-2 border-red-200' :
                        vuln.riskColor === 'orange' ? 'bg-orange-50 border-2 border-orange-200' :
                        vuln.riskColor === 'yellow' ? 'bg-yellow-50 border-2 border-yellow-200' :
                        'bg-green-50 border-2 border-green-200'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <AlertTriangle className={`w-8 h-8 mr-3 ${
                              vuln.riskColor === 'red' ? 'text-red-600' :
                              vuln.riskColor === 'orange' ? 'text-orange-600' :
                              vuln.riskColor === 'yellow' ? 'text-yellow-600' :
                              'text-green-600'
                            }`} />
                            <div>
                              <h4 className={`text-2xl font-bold ${
                                vuln.riskColor === 'red' ? 'text-red-700' :
                                vuln.riskColor === 'orange' ? 'text-orange-700' :
                                vuln.riskColor === 'yellow' ? 'text-yellow-700' :
                                'text-green-700'
                              }`}>
                                {vuln.riskLevel} Risk
                              </h4>
                              <p className="text-sm text-gray-600">Vulnerability Score: {vuln.score}/100</p>
                            </div>
                          </div>
                          <div className={`text-5xl font-bold ${
                            vuln.riskColor === 'red' ? 'text-red-600' :
                            vuln.riskColor === 'orange' ? 'text-orange-600' :
                            vuln.riskColor === 'yellow' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {vuln.score}
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              vuln.riskColor === 'red' ? 'bg-red-600' :
                              vuln.riskColor === 'orange' ? 'bg-orange-600' :
                              vuln.riskColor === 'yellow' ? 'bg-yellow-600' :
                              'bg-green-600'
                            }`}
                            style={{ width: `${vuln.score}%` }}
                          />
                        </div>
                      </div>

                      {/* Identified Vulnerabilities */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Identified Vulnerabilities:</h4>
                        {vuln.vulnerabilities.length > 0 ? (
                          <ul className="space-y-2">
                            {vuln.vulnerabilities.map((v, idx) => (
                              <li key={idx} className="flex items-start">
                                <XCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{v}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            <span className="text-sm">No major vulnerabilities detected</span>
                          </div>
                        )}
                      </div>

                      {/* Recommendations */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                        <h4 className="font-semibold text-blue-900 mb-3">Security Recommendations:</h4>
                        <ul className="space-y-2 text-sm text-blue-800">
                          {vuln.riskLevel === 'Critical' || vuln.riskLevel === 'High' ? (
                            <>
                              <li>• Immediate security patch deployment required</li>
                              <li>• Enable advanced threat protection</li>
                              <li>• Implement network segmentation</li>
                              <li>• Schedule immediate backup verification</li>
                              <li>• Deploy EDR/XDR solution</li>
                            </>
                          ) : vuln.riskLevel === 'Medium' ? (
                            <>
                              <li>• Regular security updates recommended</li>
                              <li>• Monitor for suspicious activity</li>
                              <li>• Verify backup schedule</li>
                              <li>• Review access controls</li>
                            </>
                          ) : (
                            <>
                              <li>• Maintain current security posture</li>
                              <li>• Continue regular monitoring</li>
                              <li>• Keep systems updated</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Active Directory Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Directory Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Distinguished Name</p>
                  <p className="font-mono text-sm text-gray-900 break-all">{selectedHost.distinguishedName}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button className="flex-1 btn btn-primary">
                  Run Simulation on This Host
                </button>
                <button 
                  onClick={closeModal}
                  className="flex-1 btn btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hosts;
