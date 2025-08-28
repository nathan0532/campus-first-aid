import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Star, TrendingUp, Users, Clock, Target } from 'lucide-react';
import { fetchLeaderboard, getLeaderboardStats, LeaderboardEntry, LeaderboardFilters } from '../utils/leaderboardAPI';

interface LeaderboardProps {
  timeFilter?: 'today' | 'week' | 'month' | 'all';
  maxEntries?: number;
  showFilters?: boolean;
  className?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  timeFilter = 'week',
  maxEntries = 10,
  showFilters = true,
  className = ''
}) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState(timeFilter);
  const [selectedType, setSelectedType] = useState<'overall' | 'cpr' | 'heimlich'>('overall');
  const [stats, setStats] = useState({
    averageScore: 0,
    totalTrainings: 0,
    averageTime: 0,
    participantCount: 0
  });

  // 获取排行榜数据
  useEffect(() => {
    const loadLeaderboardData = async () => {
      setLoading(true);
      
      try {
        const filters: LeaderboardFilters = {
          timeRange: selectedFilter,
          trainingType: selectedType,
          limit: maxEntries
        };
        
        const [data, statsData] = await Promise.all([
          fetchLeaderboard(filters),
          getLeaderboardStats(filters)
        ]);
        
        setLeaderboardData(data);
        setStats(statsData);
      } catch (error) {
        console.error('Failed to load leaderboard data:', error);
        setLeaderboardData([]);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboardData();
  }, [selectedFilter, selectedType, maxEntries]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return (
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600">
            {rank}
          </div>
        );
    }
  };

  const getRankChangeIcon = (change?: number) => {
    if (!change || change === 0) return null;
    
    return change > 0 ? (
      <div className="flex items-center text-green-600 text-xs">
        <TrendingUp className="h-3 w-3 mr-1" />
        +{change}
      </div>
    ) : (
      <div className="flex items-center text-red-600 text-xs">
        <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
        {change}
      </div>
    );
  };

  const getScoreForType = (entry: LeaderboardEntry) => {
    switch (selectedType) {
      case 'cpr':
        return entry.cprScore;
      case 'heimlich':
        return entry.heimlichScore;
      default:
        return entry.totalScore;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 mb-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <h2 className="text-xl font-bold text-gray-900">Leaderboard</h2>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-4 w-4 mr-1" />
            <span>{leaderboardData.length} participants</span>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { key: 'today', label: 'Today' },
                { key: 'week', label: 'Week' },
                { key: 'month', label: 'Month' },
                { key: 'all', label: 'All Time' }
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setSelectedFilter(filter.key as any)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedFilter === filter.key
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { key: 'overall', label: 'Overall' },
                { key: 'cpr', label: 'CPR' },
                { key: 'heimlich', label: 'Heimlich' }
              ].map(type => (
                <button
                  key={type.key}
                  onClick={() => setSelectedType(type.key as any)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedType === type.key
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard List */}
      <div className="p-6">
        <div className="space-y-3">
          {leaderboardData.map((entry, index) => (
            <div
              key={entry.id}
              className={`flex items-center p-4 rounded-lg transition-all hover:shadow-md ${
                entry.rank <= 3 
                  ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              {/* Rank */}
              <div className="flex items-center space-x-3 mr-4">
                {getRankIcon(entry.rank)}
                {getRankChangeIcon(entry.rankChange)}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {entry.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{entry.username}</div>
                    <div className="text-xs text-gray-500 flex items-center space-x-3">
                      <span className="flex items-center">
                        <Target className="h-3 w-3 mr-1" />
                        {entry.completedTrainings} trainings
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(entry.averageTime)} avg
                      </span>
                      <span>{getRelativeTime(entry.lastTraining)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scores */}
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold text-gray-900">
                    {getScoreForType(entry)}
                  </div>
                  <div className="flex items-center text-yellow-500">
                    {Array.from({ length: Math.floor(getScoreForType(entry) / 20) }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-current" />
                    ))}
                  </div>
                </div>
                
                {selectedType === 'overall' && (
                  <div className="text-xs text-gray-500 mt-1">
                    CPR: {entry.cprScore} | Heimlich: {entry.heimlichScore}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        {leaderboardData.length >= maxEntries && (
          <div className="text-center mt-6">
            <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
              View Full Leaderboard →
            </button>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="bg-gray-50 px-6 py-4 rounded-b-xl">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900">
              {stats.averageScore}
            </div>
            <div className="text-xs text-gray-500">Avg Score</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">
              {stats.totalTrainings}
            </div>
            <div className="text-xs text-gray-500">Total Trainings</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">
              {formatTime(stats.averageTime)}
            </div>
            <div className="text-xs text-gray-500">Avg Time</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;