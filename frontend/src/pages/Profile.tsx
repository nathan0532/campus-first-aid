import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  Trophy, 
  BookOpen, 
  Clock, 
  Award,
  Target,
  Heart,
  Users as UsersIcon,
  Edit,
  Save,
  X
} from 'lucide-react';
import { userAPI, statsAPI } from '../utils/api';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

interface PersonalStats {
  summary?: {
    totalTrainings: number;
    avgScore: number;
    bestScore: number;
  };
  scenarioBest?: any[];
  recentTrainings?: any[];
  progressTrend?: any[];
  // Fallback properties for direct access
  totalTrainings?: number;
  avgScore?: number;
  bestScore?: number;
  totalTime?: number;
  cprCount?: number;
  heimlichCount?: number;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<PersonalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ username: '', email: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First try to load profile
      const profileResponse = await userAPI.getProfile();
      setProfile(profileResponse.data.user);
      setEditData({
        username: profileResponse.data.user.username,
        email: profileResponse.data.user.email
      });

      // Then try to load stats (if this fails, profile still shows)
      try {
        const statsResponse = await statsAPI.getPersonal();
        const rawStats = statsResponse.data;
        const processedStats: PersonalStats = {
          totalTrainings: rawStats.summary?.totalTrainings || 0,
          avgScore: rawStats.summary?.avgScore || 0,
          bestScore: rawStats.summary?.bestScore || 0,
          totalTime: 0, 
          cprCount: rawStats.scenarioBest?.find((s: any) => s.scenario_type === 'cpr')?.attempts || 0,
          heimlichCount: rawStats.scenarioBest?.find((s: any) => s.scenario_type === 'heimlich')?.attempts || 0,
          recentTrainings: rawStats.recentTrainings || []
        };
        setStats(processedStats);
      } catch (statsError) {
        console.error('Failed to load stats data:', statsError);
        // Set empty stats so profile still displays
        setStats({
          totalTrainings: 0,
          avgScore: 0,
          bestScore: 0,
          totalTime: 0,
          cprCount: 0,
          heimlichCount: 0,
          recentTrainings: []
        });
      }
    } catch (error: any) {
      console.error('Failed to load profile data:', error);
      setError(error.response?.data?.error || 'Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // This would need to be implemented in the backend
      console.log('Saving profile:', editData);
      setEditing(false);
      // Reload profile data after saving
      await loadProfileData();
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    if (profile) {
      setEditData({
        username: profile.username,
        email: profile.email
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{error || 'Failed to load profile information'}</p>
        <button 
          onClick={loadProfileData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Personal Profile</h1>
              <p className="text-blue-100">Manage your account information and view training progress</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveProfile}
                    className="p-2 text-green-600 hover:text-green-700 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-2 text-red-600 hover:text-red-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {profile.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center space-x-2 mb-1">
                  <User className="h-4 w-4" />
                  <span>Username</span>
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={editData.username}
                    onChange={(e) => setEditData({...editData, username: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.username}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center space-x-2 mb-1">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </label>
                {editing ? (
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.email}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center space-x-2 mb-1">
                  <Award className="h-4 w-4" />
                  <span>Role</span>
                </label>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {profile.role === 'admin' ? 'Administrator' : 'Student'}
                </span>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center space-x-2 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Registration Date</span>
                </label>
                <p className="text-gray-900">{new Date(profile.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Training Statistics */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Training Statistics</h2>
            
            {stats ? (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <BookOpen className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalTrainings || 0}</p>
                    <p className="text-sm text-gray-600">Total Sessions</p>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Trophy className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{Math.round(stats.avgScore || 0)}</p>
                    <p className="text-sm text-gray-600">Avg Score</p>
                  </div>

                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.bestScore || 0}</p>
                    <p className="text-sm text-gray-600">Best Score</p>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatDuration(stats.totalTime || 0)}</p>
                    <p className="text-sm text-gray-600">Total Time</p>
                  </div>
                </div>

                {/* Training Breakdown */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Heart className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">CPR Training</p>
                        <p className="text-2xl font-bold text-red-600">{stats.cprCount || 0}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Completed sessions</p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <UsersIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Heimlich Maneuver</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.heimlichCount || 0}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Completed sessions</p>
                  </div>
                </div>

                {/* Recent Training History */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Recent Training Sessions</h3>
                  <div className="space-y-3">
                    {stats.recentTrainings && stats.recentTrainings.length > 0 ? (
                      stats.recentTrainings.slice(0, 5).map((training: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${training.scenario_type === 'cpr' ? 'bg-red-100' : 'bg-blue-100'}`}>
                              {training.scenario_type === 'cpr' ? (
                                <Heart className={`h-4 w-4 ${training.scenario_type === 'cpr' ? 'text-red-600' : 'text-blue-600'}`} />
                              ) : (
                                <UsersIcon className={`h-4 w-4 ${training.scenario_type === 'cpr' ? 'text-red-600' : 'text-blue-600'}`} />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {training.scenario_type === 'cpr' ? 'CPR Training' : 'Heimlich Maneuver'}
                              </p>
                              <p className="text-sm text-gray-600">
                                {new Date(training.completed_at).toLocaleDateString('en-US')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{training.score}</p>
                            <p className="text-sm text-gray-600">{formatDuration(training.duration)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No training sessions yet</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-center py-8">No statistics available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;