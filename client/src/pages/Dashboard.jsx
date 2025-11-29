import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Server, 
  Activity, 
  Bug, 
  AlertTriangle,
  TrendingUp,
  Shield,
  Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalHosts: 0,
    activeSimulations: 0,
    totalSimulations: 0,
    malwareTypes: 0
  });
  const [hosts, setHosts] = useState([]);
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [hostsRes, simsRes, malwareRes] = await Promise.all([
        axios.get('/api/hosts'),
        axios.get('/api/simulations'),
        axios.get('/api/malware')
      ]);

      setHosts(hostsRes.data.hosts || []);
      setSimulations(simsRes.data.simulations || []);

      setStats({
        totalHosts: hostsRes.data.hosts?.length || 0,
        activeSimulations: simsRes.data.simulations?.filter(s => s.status === 'running').length || 0,
        totalSimulations: simsRes.data.simulations?.length || 0,
        malwareTypes: malwareRes.data.malware?.length || 0
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const hostsByDepartment = hosts.reduce((acc, host) => {
    acc[host.department] = (acc[host.department] || 0) + 1;
    return acc;
  }, {});

  const departmentData = Object.entries(hostsByDepartment).map(([name, value]) => ({
    name,
    value
  }));

  const simulationsByStatus = simulations.reduce((acc, sim) => {
    acc[sim.status] = (acc[sim.status] || 0) + 1;
    return acc;
  }, {});

  const statusData = Object.entries(simulationsByStatus).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

  const StatCard = ({ icon: Icon, title, value, color, trend }) => (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Ransomware Simulation Platform Overview</p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <span className="text-sm text-yellow-800 font-medium">Test Environment Only</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Server}
          title="Total Hosts"
          value={stats.totalHosts}
          color="bg-blue-500"
        />
        <StatCard
          icon={Activity}
          title="Active Simulations"
          value={stats.activeSimulations}
          color="bg-red-500"
        />
        <StatCard
          icon={Clock}
          title="Total Simulations"
          value={stats.totalSimulations}
          color="bg-purple-500"
        />
        <StatCard
          icon={Bug}
          title="Malware Types"
          value={stats.malwareTypes}
          color="bg-orange-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hosts by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Simulations by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Simulations</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Malware
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Targets
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {simulations.slice(0, 5).map((sim) => (
                <tr key={sim.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {sim.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sim.malware?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sim.targetHosts?.length || 0} hosts
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      sim.status === 'running' ? 'bg-yellow-100 text-yellow-800' :
                      sim.status === 'completed' ? 'bg-green-100 text-green-800' :
                      sim.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {sim.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(sim.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
