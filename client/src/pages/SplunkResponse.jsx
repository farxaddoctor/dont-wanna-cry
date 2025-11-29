import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Activity,
  RefreshCw,
  Lock,
  Unlock,
  Database,
  TrendingUp
} from 'lucide-react';

const SplunkResponse = () => {
  const [simulations, setSimulations] = useState([]);
  const [selectedSimulation, setSelectedSimulation] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isolatedHosts, setIsolatedHosts] = useState([]);
  const [recoveryQueue, setRecoveryQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSimulations();
    fetchIsolatedHosts();
    fetchRecoveryQueue();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(() => {
      fetchIsolatedHosts();
      fetchRecoveryQueue();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchSimulations = async () => {
    try {
      const response = await axios.get('/api/simulations');
      setSimulations(response.data.simulations || []);
    } catch (error) {
      console.error('Error fetching simulations:', error);
    }
  };

  const fetchIsolatedHosts = async () => {
    try {
      const response = await axios.get('/api/splunk-response/isolated');
      setIsolatedHosts(response.data.isolatedHosts || []);
    } catch (error) {
      console.error('Error fetching isolated hosts:', error);
    }
  };

  const fetchRecoveryQueue = async () => {
    try {
      const response = await axios.get('/api/splunk-response/recovery-queue');
      setRecoveryQueue(response.data.recoveryQueue || []);
    } catch (error) {
      console.error('Error fetching recovery queue:', error);
    }
  };

  const analyzeLogs = async (simulationId) => {
    try {
      setLoading(true);
      const response = await axios.post(`/api/splunk-response/analyze/${simulationId}`);
      setAnalysis(response.data.analysis);
      setSelectedSimulation(simulationId);
    } catch (error) {
      console.error('Error analyzing logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const autoRespond = async (simulationId) => {
    try {
      setActionLoading(true);
      const response = await axios.post(`/api/splunk-response/auto-respond/${simulationId}`);
      alert(response.data.message);
      await fetchIsolatedHosts();
      await fetchRecoveryQueue();
      await analyzeLogs(simulationId);
    } catch (error) {
      console.error('Error in auto-respond:', error);
      alert('Auto-respond failed: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const isolateHost = async (hostId, reason) => {
    try {
      setActionLoading(true);
      await axios.post(`/api/splunk-response/isolate/${hostId}`, {
        reason,
        simulationId: selectedSimulation
      });
      alert(`Host ${hostId} isolated successfully`);
      await fetchIsolatedHosts();
      await fetchRecoveryQueue();
    } catch (error) {
      console.error('Error isolating host:', error);
      alert('Isolation failed: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const recoverHost = async (hostId) => {
    try {
      setActionLoading(true);
      const response = await axios.post(`/api/splunk-response/recover/${hostId}`);
      alert(response.data.message);
      await fetchIsolatedHosts();
      await fetchRecoveryQueue();
    } catch (error) {
      console.error('Error recovering host:', error);
      alert('Recovery failed: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getThreatColor = (level) => {
    switch (level) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Splunk SIEM Response</h1>
          <p className="text-gray-600 mt-1">Automated threat analysis and response based on Splunk logs</p>
        </div>
        <button
          onClick={() => {
            fetchSimulations();
            fetchIsolatedHosts();
            fetchRecoveryQueue();
          }}
          className="btn btn-secondary flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Isolated Hosts</p>
              <p className="text-3xl font-bold text-red-700 mt-1">{isolatedHosts.length}</p>
            </div>
            <Lock className="w-12 h-12 text-red-500" />
          </div>
        </div>

        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Recovery Queue</p>
              <p className="text-3xl font-bold text-blue-700 mt-1">{recoveryQueue.length}</p>
            </div>
            <Database className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Active Simulations</p>
              <p className="text-3xl font-bold text-green-700 mt-1">
                {simulations.filter(s => s.status === 'running').length}
              </p>
            </div>
            <Activity className="w-12 h-12 text-green-500" />
          </div>
        </div>
      </div>

      {/* Simulations List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analyze Simulation Logs</h3>
        <div className="space-y-3">
          {simulations.slice(0, 10).map((sim) => (
            <div
              key={sim.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">{sim.malware?.name || 'Unknown'}</p>
                <p className="text-sm text-gray-600">
                  {sim.targetHosts?.length || 0} hosts • {sim.status} • {new Date(sim.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => analyzeLogs(sim.id)}
                disabled={loading}
                className="btn btn-primary text-sm"
              >
                {loading && selectedSimulation === sim.id ? 'Analyzing...' : 'Analyze Logs'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Threat Analysis Results</h3>
            <button
              onClick={() => autoRespond(selectedSimulation)}
              disabled={actionLoading}
              className={`btn ${
                analysis.action === 'isolate' ? 'btn-danger' : 'btn-primary'
              }`}
            >
              {actionLoading ? 'Processing...' : `Auto-Respond: ${analysis.action.toUpperCase()}`}
            </button>
          </div>

          {/* Threat Level Card */}
          <div className={`p-6 rounded-lg mb-6 border-2 ${
            getThreatColor(analysis.threatLevel) === 'red' ? 'bg-red-50 border-red-200' :
            getThreatColor(analysis.threatLevel) === 'orange' ? 'bg-orange-50 border-orange-200' :
            getThreatColor(analysis.threatLevel) === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
            'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <AlertTriangle className={`w-10 h-10 mr-3 ${
                  getThreatColor(analysis.threatLevel) === 'red' ? 'text-red-600' :
                  getThreatColor(analysis.threatLevel) === 'orange' ? 'text-orange-600' :
                  getThreatColor(analysis.threatLevel) === 'yellow' ? 'text-yellow-600' :
                  'text-green-600'
                }`} />
                <div>
                  <h4 className={`text-2xl font-bold ${
                    getThreatColor(analysis.threatLevel) === 'red' ? 'text-red-700' :
                    getThreatColor(analysis.threatLevel) === 'orange' ? 'text-orange-700' :
                    getThreatColor(analysis.threatLevel) === 'yellow' ? 'text-yellow-700' :
                    'text-green-700'
                  }`}>
                    {analysis.threatLevel.toUpperCase()} Threat
                  </h4>
                  <p className="text-sm text-gray-600">Score: {analysis.threatScore}/100</p>
                </div>
              </div>
              <div className={`text-5xl font-bold ${
                getThreatColor(analysis.threatLevel) === 'red' ? 'text-red-600' :
                getThreatColor(analysis.threatLevel) === 'orange' ? 'text-orange-600' :
                getThreatColor(analysis.threatLevel) === 'yellow' ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {analysis.threatScore}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full ${
                  getThreatColor(analysis.threatLevel) === 'red' ? 'bg-red-600' :
                  getThreatColor(analysis.threatLevel) === 'orange' ? 'bg-orange-600' :
                  getThreatColor(analysis.threatLevel) === 'yellow' ? 'bg-yellow-600' :
                  'bg-green-600'
                }`}
                style={{ width: `${analysis.threatScore}%` }}
              />
            </div>
          </div>

          {/* Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Threat Indicators</h4>
              <ul className="space-y-2">
                {analysis.indicators.map((indicator, idx) => (
                  <li key={idx} className="flex items-start">
                    <XCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{indicator}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Affected Hosts</h4>
              <div className="space-y-2">
                {analysis.affectedHosts.map((host, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border">
                    <span className="text-sm font-mono">{host}</span>
                    <button
                      onClick={() => isolateHost(host, `Threat detected in simulation ${selectedSimulation}`)}
                      disabled={actionLoading}
                      className="text-xs btn btn-danger py-1 px-2"
                    >
                      Isolate
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">Recommended Actions</h4>
            <ul className="space-y-2">
              {analysis.recommendation.map((rec, idx) => (
                <li key={idx} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-blue-800">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Isolated Hosts */}
      {isolatedHosts.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Isolated Hosts</h3>
          <div className="space-y-3">
            {isolatedHosts.map((host) => (
              <div key={host.hostId} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Lock className="w-5 h-5 text-red-600 mr-2" />
                    <span className="font-semibold text-gray-900">{host.hostId}</span>
                  </div>
                  <button
                    onClick={() => recoverHost(host.hostId)}
                    disabled={actionLoading}
                    className="btn btn-primary text-sm flex items-center"
                  >
                    <Unlock className="w-4 h-4 mr-1" />
                    Recover & Restore
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-2">Reason: {host.reason}</p>
                <p className="text-xs text-gray-500">Isolated at: {new Date(host.isolatedAt).toLocaleString()}</p>
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">Actions Taken:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {host.actions.map((action, idx) => (
                      <li key={idx}>• {action}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SplunkResponse;
