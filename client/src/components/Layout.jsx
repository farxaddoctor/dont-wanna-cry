import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Server, 
  Activity, 
  Bug, 
  FileText,
  Settings, 
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react';

const Layout = ({ children, onLogout }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Hosts', href: '/hosts', icon: Server },
    { name: 'Simulations', href: '/simulations', icon: Activity },
    { name: 'Malware Library', href: '/malware', icon: Bug },
    { name: 'AI Reports', href: '/reports', icon: FileText },
    { name: 'Splunk Response', href: '/splunk-response', icon: Shield },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-gray-900 w-64`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          <div className="flex items-center mb-8 px-3">
            <Shield className="w-8 h-8 text-red-500 mr-3" />
            <span className="text-xl font-bold text-white">RansomRun</span>
          </div>
          
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center p-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-red-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="absolute bottom-4 left-0 right-0 px-3">
            <button
              onClick={onLogout}
              className="flex items-center w-full p-3 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-0'} transition-all`}>
        {/* Top Bar */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">System Active</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
