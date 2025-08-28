import React from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  BarChart3, 
  LogOut,
  Shield,
  Trophy,
  Activity,
  FileText,
  Video
} from 'lucide-react';
import { clearAuthData } from '../../utils/auth';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {

  const navigation = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: LayoutDashboard, 
      color: 'text-blue-600 bg-blue-100',
      description: 'Overview & Statistics'
    },
    { 
      id: 'users', 
      name: 'User Management', 
      icon: Users, 
      color: 'text-green-600 bg-green-100',
      description: 'Manage Students & Admins'
    },
    { 
      id: 'training', 
      name: 'Training Records', 
      icon: BookOpen, 
      color: 'text-purple-600 bg-purple-100',
      description: 'View Training History'
    },
    { 
      id: 'videos', 
      name: 'Video Management', 
      icon: Video, 
      color: 'text-indigo-600 bg-indigo-100',
      description: 'Manage Training Videos'
    },
    { 
      id: 'analytics', 
      name: 'Data Analytics', 
      icon: BarChart3, 
      color: 'text-orange-600 bg-orange-100',
      description: 'Advanced Data Analysis'
    },
    { 
      id: 'leaderboard', 
      name: 'Leaderboard', 
      icon: Trophy, 
      color: 'text-yellow-600 bg-yellow-100',
      description: 'Student Rankings'
    },
    { 
      id: 'system', 
      name: 'System Monitor', 
      icon: Activity, 
      color: 'text-red-600 bg-red-100',
      description: 'System Status Monitoring'
    }
  ];

  const handleLogout = () => {
    clearAuthData();
    window.location.href = '/login';
  };

  return (
    <div className="bg-white shadow-lg h-full flex flex-col border-r">
      {/* Logo Section */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Shield className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Admin Panel</h2>
            <p className="text-sm text-gray-500">CERT Training System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group hover:bg-gray-50 ${
                isActive 
                  ? 'bg-blue-50 border-blue-200 shadow-sm' 
                  : 'border-transparent'
              }`}
            >
              <div className={`p-2 rounded-lg ${isActive ? item.color : 'text-gray-400 bg-gray-100'} transition-colors duration-200`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <div className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                  {item.name}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {item.description}
                </div>
              </div>
              {isActive && (
                <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t space-y-2">
        <Link
          to="/"
          className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FileText className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">Back to Home</span>
        </Link>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors text-red-600"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;