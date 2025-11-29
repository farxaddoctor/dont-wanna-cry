import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Play, 
  Square, 
  Plus, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Trash2
} from 'lucide-react';
import CreateSimulationModal from '../components/CreateSimulationModal';

const Simulations = () => {
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    fetchSimulations();
    const interval = setInterval(fetchSimulations, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSimulations = async () => {
    try {
      const response = await axios.get('/api/simulations');
      setSimulations(response.data.simulations || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching simulations:', error);
      setLoading(false);
    }
  };

  const handleStartSimulation = async (id) => {
    try {
      await axios.post(`/api/simulations/${id}/start`);
      fetchSimulations();
    } catch (error) {
      alert('Error starting simulation: ' + error.response?.data?.error);
    }
  };

  const handleStopSimulation = async (id) => {
    try {
      await axios.post(`/api/simulations/${id}/stop`);
      fetchSimulations();
    } catch (error) {
      alert('Error stopping simulation: ' + error.response?.data?.error);
    }
  };

  const handleDeleteSimulation = async (id) => {
    if (!confirm('Are you sure you want to delete this simulation?')) return;
    
    try {
      await axios.delete(`/api/simulations/${id}`);
      fetchSimulations();
    } catch (error) {
      alert('Error deleting simulation: ' + error.response?.data?.error);
    }
  };

  const handleRevertSimulation = async (id) => {
    try {
      await axios.post(`/api/simulations/${id}/revert`);
      alert('Simulation reverted successfully');
      fetchSimulations();
    } catch (error) {
      alert('Error reverting simulation: ' + error.response?.data?.error);
    }
  };

  const filteredSimulations = selectedStatus === 'all' 
    ? simulations 
    : simulations.filter(s => s.status === selectedStatus);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'stopped':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Simulations</h1>
          <p className="text-gray-600 mt-1">Manage ransomware simulations</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchSimulations}
            className="btn btn-secondary flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Simulation
          </button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="card">
        <div className="flex space-x-2">
          {['all', 'pending', 'running', 'completed', 'failed', 'stopped'].map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === status
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Simulations List */}
      <div className="space-y-4">
        {filteredSimulations.map((sim) => (
          <div key={sim.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  {getStatusIcon(sim.status)}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {sim.malware?.name || 'Unknown Malware'}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(sim.status)}`}>
                    {sim.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Simulation ID</p>
                    <p className="text-sm font-medium text-gray-900">{sim.id.substring(0, 8)}...</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Target Hosts</p>
                    <p className="text-sm font-medium text-gray-900">
                      {sim.targetHosts?.length || 0} hosts
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(sim.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {sim.status === 'running' && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm font-medium text-gray-900">{sim.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${sim.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {sim.targetHosts && sim.targetHosts.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Affected Hosts:</p>
                    <div className="flex flex-wrap gap-2">
                      {sim.targetHosts.map((host, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {host.hostname}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {sim.config && (
                  <div className="flex items-center space-x-4 text-sm">
                    {sim.config.dryRun && (
                      <span className="flex items-center text-blue-600">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Dry Run Mode
                      </span>
                    )}
                    {sim.config.autoRevert && (
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Auto-Revert Enabled
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                {sim.status === 'pending' && (
                  <button
                    onClick={() => handleStartSimulation(sim.id)}
                    className="btn btn-primary flex items-center"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </button>
                )}
                {sim.status === 'running' && (
                  <button
                    onClick={() => handleStopSimulation(sim.id)}
                    className="btn btn-danger flex items-center"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop
                  </button>
                )}
                {(sim.status === 'completed' || sim.status === 'stopped') && (
                  <button
                    onClick={() => handleRevertSimulation(sim.id)}
                    className="btn btn-secondary flex items-center text-sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Revert
                  </button>
                )}
                {sim.status !== 'running' && (
                  <button
                    onClick={() => handleDeleteSimulation(sim.id)}
                    className="btn btn-secondary flex items-center text-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSimulations.length === 0 && (
        <div className="card text-center py-12">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No simulations found</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary mt-4"
          >
            Create Your First Simulation
          </button>
        </div>
      )}

      {showCreateModal && (
        <CreateSimulationModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchSimulations();
          }}
        />
      )}
    </div>
  );
};

export default Simulations;
