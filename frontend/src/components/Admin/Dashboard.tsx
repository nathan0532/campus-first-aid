import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  Trophy, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Activity,
  AlertCircle,
  CheckCircle,
  UserPlus,
  Calendar
} from 'lucide-react';
import { statsAPI } from '../../utils/api';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await statsAPI.getOverview();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.overview?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Total Training Sessions',
      value: stats?.overview?.totalTrainings || 0,
      icon: BookOpen,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      change: '+23%',
      trend: 'up'
    },
    {
      title: 'Average Score',
      value: stats?.overview?.avgScore || 0,
      icon: Trophy,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      change: '+5%',
      trend: 'up'
    },
    {
      title: 'Today\'s Training',
      value: stats?.overview?.todayTrainings || 0,
      icon: Clock,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      change: '-8%',
      trend: 'down'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome to CERT Emergency Training System Admin Panel</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
          
          <button 
            onClick={loadDashboardData}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Activity className="h-4 w-4" />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`${stat.bgColor} rounded-xl p-6 border hover:shadow-lg transition-all duration-200`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center space-x-1 mt-2">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 ${stat.color} rounded-full text-white`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Training Scenarios Chart */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Scenario Statistics</h3>
          <div className="space-y-4">
            {stats?.scenarioStats?.map((scenario: any, index: number) => (
              <div key={scenario.scenario_type} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {scenario.scenario_type === 'cpr' ? 'CPR (Cardiopulmonary Resuscitation)' : 'Heimlich Maneuver'}
                  </span>
                  <span className="text-sm text-gray-500">{scenario.count} sessions</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${index === 0 ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min((scenario.count / Math.max(...stats.scenarioStats.map((s: any) => s.count))) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Avg Score: {Math.round(scenario.avg_score || 0)}</span>
                  <span>Max Score: {scenario.max_score || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-green-100 rounded-full">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">New user student4 registered successfully</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-blue-100 rounded-full">
                <BookOpen className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">User demo completed CPR training with score 95</p>
                <p className="text-xs text-gray-500">3 hours ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-1 bg-yellow-100 rounded-full">
                <Trophy className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">User alex set new Heimlich training record</p>
                <p className="text-xs text-gray-500">5 hours ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-1 bg-red-100 rounded-full">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">System maintenance performed</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Trend Chart */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">7-Day Training Trend</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Training Count</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Average Score</span>
            </div>
          </div>
        </div>
        
        <div className="h-64 flex items-end justify-between space-x-2">
          {stats?.weeklyTrend?.map((day: any, index: number) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col items-center space-y-1 mb-2">
                <div 
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${(day.count / Math.max(...stats.weeklyTrend.map((d: any) => d.count))) * 120}px` }}
                ></div>
                <div 
                  className="w-full bg-green-500 rounded-t"
                  style={{ height: `${(day.avg_score / 100) * 60}px` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500">{new Date(day.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 bg-white/20 rounded-lg p-4 hover:bg-white/30 transition-colors">
            <UserPlus className="h-5 w-5" />
            <span>Add New User</span>
          </button>
          
          <button className="flex items-center space-x-3 bg-white/20 rounded-lg p-4 hover:bg-white/30 transition-colors">
            <Calendar className="h-5 w-5" />
            <span>View Training Plan</span>
          </button>
          
          <button className="flex items-center space-x-3 bg-white/20 rounded-lg p-4 hover:bg-white/30 transition-colors">
            <Activity className="h-5 w-5" />
            <span>System Monitor</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;