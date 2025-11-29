import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Hosts from './pages/Hosts';
import Simulations from './pages/Simulations';
import Malware from './pages/Malware';
import Reports from './pages/Reports';
import SplunkResponse from './pages/SplunkResponse';
import Settings from './pages/Settings';
import Login from './pages/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('token') !== null
  );

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Layout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/hosts" element={<Hosts />} />
          <Route path="/simulations" element={<Simulations />} />
          <Route path="/malware" element={<Malware />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/splunk-response" element={<SplunkResponse />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
