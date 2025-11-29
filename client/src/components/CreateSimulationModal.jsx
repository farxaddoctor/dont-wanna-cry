import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';

const CreateSimulationModal = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [hosts, setHosts] = useState([]);
  const [malware, setMalware] = useState([]);
  const [selectedHosts, setSelectedHosts] = useState([]);
  const [selectedMalware, setSelectedMalware] = useState(null);
  const [config, setConfig] = useState({
    dryRun: true,
    duration: 300,
    intensity: 'medium',
    autoRevert: true,
    notifyOnComplete: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [hostsRes, malwareRes] = await Promise.all([
        axios.get('/api/hosts'),
        axios.get('/api/malware')
      ]);
      setHosts(hostsRes.data.hosts || []);
      setMalware(malwareRes.data.malware || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleHostToggle = (hostId) => {
    setSelectedHosts(prev =>
      prev.includes(hostId)
        ? prev.filter(id => id !== hostId)
        : [...prev, hostId]
    );
  };

  const handleSubmit = async () => {
    if (selectedHosts.length === 0) {
      alert('Please select at least one host');
      return;
    }
    if (!selectedMalware) {
      alert('Please select a malware type');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/simulations', {
        targetHosts: selectedHosts,
        malwareId: selectedMalware,
        ...config
      });

      if (response.data.success) {
        onSuccess();
      }
    } catch (error) {
      alert('Error creating simulation: ' + error.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Create New Simulation</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step > s ? 'bg-red-600' : 'bg-gray-200'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Select Hosts */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Step 1: Select Target Hosts
              </h3>
              <p className="text-gray-600 mb-4">
                Choose which hosts to include in this simulation
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {hosts.map((host) => (
                  <div
                    key={host.id}
                    onClick={() => handleHostToggle(host.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedHosts.includes(host.id)
                        ? 'border-red-600 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{host.name}</p>
                        <p className="text-sm text-gray-600">{host.hostname}</p>
                        <p className="text-xs text-gray-500 mt-1">{host.department}</p>
                      </div>
                      {selectedHosts.includes(host.id) && (
                        <CheckCircle className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-600">
                Selected: {selectedHosts.length} host(s)
              </div>
            </div>
          )}

          {/* Step 2: Select Malware */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Step 2: Select Malware Type
              </h3>
              <p className="text-gray-600 mb-4">
                Choose the ransomware behavior to simulate
              </p>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {malware.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMalware(m.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedMalware === m.id
                        ? 'border-red-600 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{m.name}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            m.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            m.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {m.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{m.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {m.behaviors.slice(0, 3).map((behavior, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              {behavior}
                            </span>
                          ))}
                          {m.behaviors.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              +{m.behaviors.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedMalware === m.id && (
                        <CheckCircle className="w-6 h-6 text-red-600 ml-4" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Configure */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Step 3: Configure Simulation
              </h3>
              <p className="text-gray-600 mb-4">
                Set simulation parameters and safety options
              </p>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Dry Run Mode</p>
                    <p className="text-sm text-gray-600">Simulate without actual file modifications</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.dryRun}
                    onChange={(e) => setConfig({ ...config, dryRun: e.target.checked })}
                    className="w-5 h-5"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Auto-Revert</p>
                    <p className="text-sm text-gray-600">Automatically revert changes after completion</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.autoRevert}
                    onChange={(e) => setConfig({ ...config, autoRevert: e.target.checked })}
                    className="w-5 h-5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    value={config.duration}
                    onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })}
                    className="input"
                    min="60"
                    max="3600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intensity
                  </label>
                  <select
                    value={config.intensity}
                    onChange={(e) => setConfig({ ...config, intensity: e.target.value })}
                    className="input"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900">Safety Notice</p>
                      <p className="text-sm text-yellow-800 mt-1">
                        This simulation will be logged to your SIEM and can be monitored in real-time.
                        All actions are reversible when auto-revert is enabled.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : onClose()}
              className="btn btn-secondary"
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && selectedHosts.length === 0}
                className="btn btn-primary"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Creating...' : 'Create Simulation'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSimulationModal;
