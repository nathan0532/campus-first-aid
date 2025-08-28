// Leaderboard API utilities
// 在实际项目中，这些函数会调用真实的后端API

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatar?: string;
  totalScore: number;
  cprScore: number;
  heimlichScore: number;
  completedTrainings: number;
  averageTime: number;
  lastTraining: string;
  rank: number;
  rankChange?: number;
}

export interface LeaderboardFilters {
  timeRange: 'today' | 'week' | 'month' | 'all';
  trainingType: 'overall' | 'cpr' | 'heimlich';
  limit?: number;
}

// 模拟数据生成器
const generateMockData = (): LeaderboardEntry[] => {
  const names = [
    'EmergencyExpert', 'LifeSaver2024', 'MedStudent', 'FirstAidHero', 'EMTPro',
    'SafetyFirst', 'RescuePro', 'HealthGuardian', 'CriticalCare', 'ParamedicAce',
    'ERNurse', 'FirefighterMike', 'NursingStudent', 'DocInTraining', 'EMSRookie',
    'TraumaTeam', 'CodeBlueHero', 'AmbulanceCrew', 'ER_Doctor', 'FlightMedic'
  ];

  return names.map((name, index) => {
    const baseScore = 100 - (index * 2) - Math.random() * 5;
    const cprVariation = (Math.random() - 0.5) * 10;
    const heimlichVariation = (Math.random() - 0.5) * 10;
    
    return {
      id: `user_${index + 1}`,
      username: name,
      totalScore: Math.round(baseScore),
      cprScore: Math.max(60, Math.min(100, Math.round(baseScore + cprVariation))),
      heimlichScore: Math.max(60, Math.min(100, Math.round(baseScore + heimlichVariation))),
      completedTrainings: Math.floor(Math.random() * 20) + 5,
      averageTime: Math.floor(180 + Math.random() * 200), // 3-6 minutes
      lastTraining: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      rank: index + 1,
      rankChange: Math.floor(Math.random() * 5) - 2 // -2 to +2
    };
  }).sort((a, b) => b.totalScore - a.totalScore);
};

// 模拟API调用
export const fetchLeaderboard = async (filters: LeaderboardFilters): Promise<LeaderboardEntry[]> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
  
  const data = generateMockData();
  
  // 根据训练类型筛选和排序
  let sortedData = [...data];
  if (filters.trainingType === 'cpr') {
    sortedData.sort((a, b) => b.cprScore - a.cprScore);
  } else if (filters.trainingType === 'heimlich') {
    sortedData.sort((a, b) => b.heimlichScore - a.heimlichScore);
  }
  
  // 根据时间范围筛选（简化实现）
  if (filters.timeRange !== 'all') {
    const daysBack = {
      today: 1,
      week: 7,
      month: 30
    }[filters.timeRange];
    
    const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    sortedData = sortedData.filter(entry => 
      new Date(entry.lastTraining) >= cutoffDate
    );
  }
  
  // 重新计算排名
  sortedData.forEach((entry, index) => {
    entry.rank = index + 1;
  });
  
  // 应用限制
  if (filters.limit) {
    sortedData = sortedData.slice(0, filters.limit);
  }
  
  return sortedData;
};

// 获取用户在排行榜中的位置
export const getUserRank = async (userId: string, filters: LeaderboardFilters): Promise<{
  rank: number;
  totalUsers: number;
  percentile: number;
}> => {
  const fullLeaderboard = await fetchLeaderboard({ ...filters, limit: undefined });
  const userIndex = fullLeaderboard.findIndex(entry => entry.id === userId);
  
  if (userIndex === -1) {
    return {
      rank: -1,
      totalUsers: fullLeaderboard.length,
      percentile: 0
    };
  }
  
  return {
    rank: userIndex + 1,
    totalUsers: fullLeaderboard.length,
    percentile: Math.round(((fullLeaderboard.length - userIndex) / fullLeaderboard.length) * 100)
  };
};

// 获取排行榜统计信息
export const getLeaderboardStats = async (filters: LeaderboardFilters): Promise<{
  averageScore: number;
  totalTrainings: number;
  averageTime: number;
  topScore: number;
  participantCount: number;
}> => {
  const data = await fetchLeaderboard(filters);
  
  if (data.length === 0) {
    return {
      averageScore: 0,
      totalTrainings: 0,
      averageTime: 0,
      topScore: 0,
      participantCount: 0
    };
  }
  
  const totalScore = data.reduce((sum, entry) => {
    switch (filters.trainingType) {
      case 'cpr':
        return sum + entry.cprScore;
      case 'heimlich':
        return sum + entry.heimlichScore;
      default:
        return sum + entry.totalScore;
    }
  }, 0);
  
  return {
    averageScore: Math.round(totalScore / data.length),
    totalTrainings: data.reduce((sum, entry) => sum + entry.completedTrainings, 0),
    averageTime: Math.round(data.reduce((sum, entry) => sum + entry.averageTime, 0) / data.length),
    topScore: Math.max(...data.map(entry => {
      switch (filters.trainingType) {
        case 'cpr':
          return entry.cprScore;
        case 'heimlich':
          return entry.heimlichScore;
        default:
          return entry.totalScore;
      }
    })),
    participantCount: data.length
  };
};