import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Star, Users, TrendingUp } from 'lucide-react';

interface SimpleLeaderboardEntry {
  id: string;
  username: string;
  score: number;
  rank: number;
  change?: number;
}

const SimpleLeaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<SimpleLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockData: SimpleLeaderboardEntry[] = [
        { id: '1', username: 'EmergencyExpert', score: 98, rank: 1, change: 1 },
        { id: '2', username: 'LifeSaver2024', score: 95, rank: 2, change: -1 },
        { id: '3', username: 'MedStudent', score: 94, rank: 3, change: 0 },
        { id: '4', username: 'FirstAidHero', score: 92, rank: 4, change: 2 },
        { id: '5', username: 'EMTPro', score: 91, rank: 5, change: -1 },
        { id: '6', username: 'SafetyFirst', score: 89, rank: 6, change: 1 }
      ];
      
      setLeaderboard(mockData);
      setLoading(false);
    };

    loadData();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return (
          <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs font-semibold text-gray-600">
            {rank}
          </div>
        );
    }
  };

  const getChangeIcon = (change?: number) => {
    if (!change || change === 0) return null;
    
    return change > 0 ? (
      <div className="flex items-center text-green-600 text-xs">
        <TrendingUp className="h-3 w-3" />
        <span className="ml-1">+{change}</span>
      </div>
    ) : (
      <div className="flex items-center text-red-600 text-xs">
        <TrendingUp className="h-3 w-3 rotate-180" />
        <span className="ml-1">{change}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-8 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Trophy className="h-6 w-6" />
            <h3 className="text-xl font-bold">Top Performers</h3>
          </div>
          <div className="flex items-center text-sm opacity-90">
            <Users className="h-4 w-4 mr-1" />
            <span>This Week</span>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="p-6">
        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center p-3 rounded-lg transition-all ${
                entry.rank <= 3 
                  ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              {/* Rank */}
              <div className="flex items-center space-x-2 mr-4">
                {getRankIcon(entry.rank)}
                {getChangeIcon(entry.change)}
              </div>

              {/* User */}
              <div className="flex-1 flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {entry.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{entry.username}</div>
                  <div className="text-xs text-gray-500">Emergency Responder</div>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  <div className="text-xl font-bold text-gray-900">{entry.score}</div>
                  <div className="flex items-center">
                    {Array.from({ length: Math.floor(entry.score / 20) }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View More */}
        <div className="text-center mt-6">
          <button className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors">
            View Full Leaderboard →
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4">
        <div className="text-center text-sm text-gray-600">
          Complete training sessions to climb the rankings!
        </div>
      </div>
    </div>
  );
};

export default SimpleLeaderboard;