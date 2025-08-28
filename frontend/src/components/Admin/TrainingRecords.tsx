import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Download, 
  Eye,
  Calendar,
  Clock,
  Trophy,
  TrendingUp,
  Heart,
  Users as UsersIcon,
  BarChart3
} from 'lucide-react';
import { trainingAPI } from '../../utils/api';

interface TrainingRecord {
  id: number;
  username: string;
  scenario_type: 'cpr' | 'heimlich';
  score: number;
  duration: number;
  completed_at: string;
  steps_data: any[];
}

const TrainingRecords: React.FC = () => {
  const [records, setRecords] = useState<TrainingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [scenarioFilter, setScenarioFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('completed_at');
  const [selectedRecord, setSelectedRecord] = useState<TrainingRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const response = await trainingAPI.getAllRecords(1, 100);
      setRecords(response.data.records || []);
    } catch (error) {
      console.error('Failed to load training records:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesScenario = scenarioFilter === 'all' || record.scenario_type === scenarioFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const recordDate = new Date(record.completed_at);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          matchesDate = recordDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = recordDate >= weekAgo;
          break;
        case 'month':
          matchesDate = recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
          break;
      }
    }
    
    return matchesSearch && matchesScenario && matchesDate;
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScenarioIcon = (type: string) => {
    return type === 'cpr' ? Heart : UsersIcon;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const exportRecords = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Username,Training Type,Score,Duration,Completion Time\n"
      + filteredRecords.map(record => 
          `${record.username},${record.scenario_type === 'cpr' ? 'CPR Training' : 'Heimlich Maneuver'},${record.score},${formatDuration(record.duration)},${new Date(record.completed_at).toLocaleString()}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "training_records.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 统计数据
  const stats = {
    total: records.length,
    avgScore: Math.round(records.reduce((sum, r) => sum + r.score, 0) / records.length) || 0,
    cprCount: records.filter(r => r.scenario_type === 'cpr').length,
    heimlichCount: records.filter(r => r.scenario_type === 'heimlich').length,
    todayCount: records.filter(r => new Date(r.completed_at).toDateString() === new Date().toDateString()).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Training Records</h1>
          <p className="text-gray-600 mt-1">View and manage all user training records</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={exportRecords}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export Records</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Training Sessions</p>
              <p className="text-lg font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Trophy className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="text-lg font-semibold text-gray-900">{stats.avgScore}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Heart className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">CPR Training</p>
              <p className="text-lg font-semibold text-gray-900">{stats.cprCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UsersIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Heimlich Maneuver</p>
              <p className="text-lg font-semibold text-gray-900">{stats.heimlichCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Today's Training</p>
              <p className="text-lg font-semibold text-gray-900">{stats.todayCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>

            <select
              value={scenarioFilter}
              onChange={(e) => setScenarioFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="cpr">CPR Training</option>
              <option value="heimlich">Heimlich Maneuver</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            Showing {filteredRecords.length} / {records.length} records
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Training Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completion Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.map((record) => {
                const ScenarioIcon = getScenarioIcon(record.scenario_type);
                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              {record.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{record.username}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`p-1 rounded ${record.scenario_type === 'cpr' ? 'bg-red-100' : 'bg-blue-100'} mr-2`}>
                          <ScenarioIcon className={`h-4 w-4 ${record.scenario_type === 'cpr' ? 'text-red-600' : 'text-blue-600'}`} />
                        </div>
                        <span className="text-sm text-gray-900">
                          {record.scenario_type === 'cpr' ? 'CPR Training' : 'Heimlich Maneuver'}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreColor(record.score)}`}>
                        {record.score}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                        {formatDuration(record.duration)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(record.completed_at).toLocaleString('en-US')}
                    </td>
                    
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedRecord(record);
                          setShowDetailModal(true);
                        }}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="text-sm">Details</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Training Record Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">User</label>
                  <p className="text-gray-900">{selectedRecord.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Training Type</label>
                  <p className="text-gray-900">
                    {selectedRecord.scenario_type === 'cpr' ? 'CPR Training' : 'Heimlich Maneuver'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Score</label>
                  <p className="text-gray-900">{selectedRecord.score}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Duration</label>
                  <p className="text-gray-900">{formatDuration(selectedRecord.duration)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Completion Time</label>
                  <p className="text-gray-900">
                    {new Date(selectedRecord.completed_at).toLocaleString('en-US')}
                  </p>
                </div>
              </div>
              
              {selectedRecord.steps_data && selectedRecord.steps_data.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Training Steps Details</label>
                  <div className="bg-gray-50 rounded p-3 text-sm">
                    <pre>{JSON.stringify(selectedRecord.steps_data, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingRecords;