import React, { useState, useEffect } from 'react';
import { isAdmin } from '../utils/auth';
import Sidebar from '../components/Admin/Sidebar';
import Dashboard from '../components/Admin/Dashboard';
import UserManagement from '../components/Admin/UserManagement';
import TrainingRecords from '../components/Admin/TrainingRecords';
import VideoManagement from '../components/Admin/VideoManagement';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!isAdmin()) {
      window.location.href = '/';
      return;
    }
  }, []);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UserManagement />;
      case 'training':
        return <TrainingRecords />;
      case 'videos':
        return <VideoManagement />;
      case 'analytics':
        return <Dashboard />; // 可以创建专门的分析组件
      case 'leaderboard':
        return <Dashboard />; // 可以创建排行榜组件
      case 'system':
        return <Dashboard />; // 可以创建系统监控组件
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default Admin;