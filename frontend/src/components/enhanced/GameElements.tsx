import React, { useState, useEffect } from 'react';
import { Star, Zap, Trophy, Target, Award, Flame } from 'lucide-react';

interface GameScore {
  totalScore: number;
  accuracy: number;
  speed: number;
  technique: number;
  bonus: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface ComboState {
  count: number;
  multiplier: number;
  lastActionTime: number;
}

interface GameElementsProps {
  currentScore: GameScore;
  onScoreUpdate?: (score: GameScore) => void;
  onAchievementUnlocked?: (achievement: Achievement) => void;
  className?: string;
}

const GameElements: React.FC<GameElementsProps> = ({
  currentScore,
  onScoreUpdate,
  onAchievementUnlocked,
  className = ''
}) => {
  const [displayScore, setDisplayScore] = useState(currentScore.totalScore);
  const [combo, setCombo] = useState<ComboState>({ count: 0, multiplier: 1, lastActionTime: 0 });
  const [recentPoints, setRecentPoints] = useState<Array<{id: number, points: number, type: string}>>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first_perfect',
      title: 'Perfect Start',
      description: 'Execute your first perfect action',
      icon: <Star className="h-5 w-5" />,
      unlocked: false
    },
    {
      id: 'speed_demon',
      title: 'Speed Demon',
      description: 'Complete all actions under time limit',
      icon: <Zap className="h-5 w-5" />,
      unlocked: false
    },
    {
      id: 'combo_master',
      title: 'Combo Master',
      description: 'Achieve 5 perfect actions in a row',
      icon: <Flame className="h-5 w-5" />,
      unlocked: false,
      progress: 0,
      maxProgress: 5
    },
    {
      id: 'life_saver',
      title: 'Life Saver',
      description: 'Complete training with 90+ overall score',
      icon: <Trophy className="h-5 w-5" />,
      unlocked: false
    },
    {
      id: 'precision_expert',
      title: 'Precision Expert',
      description: 'Maintain 95%+ accuracy throughout training',
      icon: <Target className="h-5 w-5" />,
      unlocked: false
    }
  ]);

  // 分数动画效果
  useEffect(() => {
    const difference = currentScore.totalScore - displayScore;
    if (difference !== 0) {
      const step = difference / 20;
      const timer = setInterval(() => {
        setDisplayScore(prev => {
          const next = prev + step;
          if ((step > 0 && next >= currentScore.totalScore) || 
              (step < 0 && next <= currentScore.totalScore)) {
            clearInterval(timer);
            return currentScore.totalScore;
          }
          return next;
        });
      }, 16);
      return () => clearInterval(timer);
    }
  }, [currentScore.totalScore, displayScore]);

  // 连击系统
  const updateCombo = (actionQuality: 'perfect' | 'good' | 'poor') => {
    const now = Date.now();
    
    if (actionQuality === 'perfect' && now - combo.lastActionTime < 5000) {
      const newCount = combo.count + 1;
      const newMultiplier = Math.min(Math.floor(newCount / 3) + 1, 5);
      
      setCombo({
        count: newCount,
        multiplier: newMultiplier,
        lastActionTime: now
      });

      // 检查连击成就
      if (newCount >= 5) {
        checkAchievement('combo_master');
      }

      // 显示连击效果
      if (newCount >= 3) {
        showRecentPoints(newMultiplier * 10, 'combo');
      }
    } else if (actionQuality === 'poor') {
      setCombo({ count: 0, multiplier: 1, lastActionTime: now });
    } else {
      setCombo(prev => ({ ...prev, lastActionTime: now }));
    }
  };

  // 显示获得分数
  const showRecentPoints = (points: number, type: string) => {
    const id = Date.now();
    setRecentPoints(prev => [...prev, { id, points, type }]);
    
    // 3秒后移除
    setTimeout(() => {
      setRecentPoints(prev => prev.filter(p => p.id !== id));
    }, 3000);
  };

  // 检查成就
  const checkAchievement = (achievementId: string) => {
    setAchievements(prev => prev.map(achievement => {
      if (achievement.id === achievementId && !achievement.unlocked) {
        const updated = { ...achievement, unlocked: true };
        onAchievementUnlocked?.(updated);
        return updated;
      }
      return achievement;
    }));
  };

  // 计算星级评分
  const getStarRating = (score: number): number => {
    if (score >= 90) return 5;
    if (score >= 80) return 4;
    if (score >= 70) return 3;
    if (score >= 60) return 2;
    if (score >= 50) return 1;
    return 0;
  };

  // 获取评分颜色
  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-500';
    if (score >= 80) return 'text-blue-500';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  // 渲染星星评分
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const starRating = getStarRating(displayScore);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 主要分数显示 */}
      <div className="bg-white rounded-lg shadow-lg p-6 text-center relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-50" />
        
        <div className="relative z-10">
          <div className="mb-2">
            <div className="flex items-center justify-center space-x-1 mb-1">
              {renderStars(starRating)}
            </div>
            <div className={`text-4xl font-bold ${getScoreColor(displayScore)}`}>
              {Math.round(displayScore)}
            </div>
            <div className="text-sm text-gray-600">Overall Score</div>
          </div>

          {/* 分数分解 */}
          <div className="grid grid-cols-4 gap-2 mt-4 text-xs">
            <div className="text-center">
              <div className="font-semibold text-blue-600">{Math.round(currentScore.accuracy)}</div>
              <div className="text-gray-500">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">{Math.round(currentScore.speed)}</div>
              <div className="text-gray-500">Speed</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-purple-600">{Math.round(currentScore.technique)}</div>
              <div className="text-gray-500">Technique</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-orange-600">{Math.round(currentScore.bonus)}</div>
              <div className="text-gray-500">Bonus</div>
            </div>
          </div>
        </div>

        {/* 飘动的分数 */}
        {recentPoints.map(point => (
          <div
            key={point.id}
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
              font-bold text-lg pointer-events-none z-20 animate-bounce
              ${point.type === 'combo' ? 'text-purple-600' : 'text-green-600'}`}
            style={{
              animation: 'pointsFloat 3s ease-out forwards',
              animationDelay: '0s'
            }}
          >
            +{point.points}
            {point.type === 'combo' && ' COMBO!'}
          </div>
        ))}
      </div>

      {/* 连击指示器 */}
      {combo.count >= 3 && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Flame className="h-6 w-6 animate-pulse" />
            <span className="text-xl font-bold">COMBO x{combo.multiplier}</span>
            <Flame className="h-6 w-6 animate-pulse" />
          </div>
          <div className="text-sm opacity-90">
            {combo.count} perfect actions in a row!
          </div>
        </div>
      )}

      {/* 成就展示 */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
          <Award className="h-5 w-5 mr-2 text-yellow-500" />
          Achievements
        </h3>
        
        <div className="grid grid-cols-1 gap-2">
          {achievements.map(achievement => (
            <div
              key={achievement.id}
              className={`flex items-center space-x-3 p-2 rounded-lg transition-all ${
                achievement.unlocked 
                  ? 'bg-yellow-50 border border-yellow-200' 
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className={`p-2 rounded-full ${
                achievement.unlocked 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-gray-300 text-gray-500'
              }`}>
                {achievement.icon}
              </div>
              
              <div className="flex-1">
                <div className={`font-medium text-sm ${
                  achievement.unlocked ? 'text-yellow-800' : 'text-gray-600'
                }`}>
                  {achievement.title}
                </div>
                <div className="text-xs text-gray-500">
                  {achievement.description}
                </div>
                
                {/* 进度条 */}
                {achievement.maxProgress && !achievement.unlocked && (
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-blue-500 h-1 rounded-full transition-all"
                        style={{
                          width: `${((achievement.progress || 0) / achievement.maxProgress) * 100}%`
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {achievement.progress || 0} / {achievement.maxProgress}
                    </div>
                  </div>
                )}
              </div>
              
              {achievement.unlocked && (
                <div className="text-yellow-500">
                  <Trophy className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CSS 动画 */}
      <style>{`
        @keyframes pointsFloat {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -100px) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -120px) scale(0.8);
          }
        }
      `}</style>
    </div>
  );
};

// 分数计算工具函数
export const calculateScore = {
  // 基于操作质量计算分数
  forAction: (accuracy: number, speed: number, technique: number): number => {
    return Math.round((accuracy * 0.4 + speed * 0.3 + technique * 0.3) * 100);
  },

  // 计算总分
  overall: (actions: Array<{accuracy: number, speed: number, technique: number}>): GameScore => {
    if (actions.length === 0) {
      return { totalScore: 0, accuracy: 0, speed: 0, technique: 0, bonus: 0 };
    }

    const avgAccuracy = actions.reduce((sum, a) => sum + a.accuracy, 0) / actions.length;
    const avgSpeed = actions.reduce((sum, a) => sum + a.speed, 0) / actions.length;
    const avgTechnique = actions.reduce((sum, a) => sum + a.technique, 0) / actions.length;

    const baseScore = avgAccuracy * 0.4 + avgSpeed * 0.3 + avgTechnique * 0.3;
    
    // 计算奖励分数
    let bonus = 0;
    if (avgAccuracy >= 0.95) bonus += 10; // 高精度奖励
    if (avgSpeed >= 0.9) bonus += 5; // 速度奖励
    if (actions.length >= 5 && actions.every(a => a.accuracy >= 0.8)) bonus += 15; // 一致性奖励

    return {
      totalScore: Math.round((baseScore + bonus) * 100),
      accuracy: Math.round(avgAccuracy * 100),
      speed: Math.round(avgSpeed * 100),
      technique: Math.round(avgTechnique * 100),
      bonus: bonus * 100
    };
  }
};

export default GameElements;