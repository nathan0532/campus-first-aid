import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Star, Zap } from 'lucide-react';

interface OperationFeedbackProps {
  type: 'success' | 'warning' | 'error' | 'perfect' | 'combo';
  message: string;
  duration?: number; // 显示时长，毫秒
  onComplete?: () => void;
  className?: string;
}

interface ParticleProps {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

const OperationFeedback: React.FC<OperationFeedbackProps> = ({
  type,
  message,
  duration = 2000,
  onComplete,
  className = ''
}) => {
  const [visible, setVisible] = useState(true);
  const [particles, setParticles] = useState<ParticleProps[]>([]);
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'display' | 'exit'>('enter');

  useEffect(() => {
    // 入场动画
    setAnimationPhase('enter');
    
    // 生成粒子效果
    if (type === 'perfect' || type === 'combo') {
      generateParticles();
    }

    const timer1 = setTimeout(() => {
      setAnimationPhase('display');
    }, 300);

    // 显示时间
    const timer2 = setTimeout(() => {
      setAnimationPhase('exit');
      setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 300);
    }, duration);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [type, duration, onComplete]);

  const generateParticles = () => {
    const newParticles: ParticleProps[] = [];
    const colors = type === 'perfect' ? ['#FFD700', '#FFA500', '#FF69B4'] : ['#00FF00', '#32CD32', '#ADFF2F'];
    
    for (let i = 0; i < 12; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4
      });
    }
    setParticles(newParticles);

    // 清除粒子
    setTimeout(() => setParticles([]), 1500);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-8 w-8 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-8 w-8 text-red-500" />;
      case 'perfect':
        return <Star className="h-8 w-8 text-yellow-400" fill="currentColor" />;
      case 'combo':
        return <Zap className="h-8 w-8 text-blue-500" fill="currentColor" />;
      default:
        return <CheckCircle className="h-8 w-8 text-gray-500" />;
    }
  };

  const getContainerStyles = () => {
    const baseStyles = "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none";
    
    switch (animationPhase) {
      case 'enter':
        return `${baseStyles} scale-75 opacity-0 transition-all duration-300 ease-out`;
      case 'display':
        return `${baseStyles} scale-100 opacity-100 transition-all duration-300 ease-out`;
      case 'exit':
        return `${baseStyles} scale-125 opacity-0 transition-all duration-300 ease-in`;
      default:
        return baseStyles;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'perfect':
        return 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300';
      case 'combo':
        return 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'warning':
        return 'text-yellow-800';
      case 'error':
        return 'text-red-800';
      case 'perfect':
        return 'text-yellow-800';
      case 'combo':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  if (!visible) return null;

  return (
    <>
      {/* 主反馈框 */}
      <div className={`${getContainerStyles()} ${className}`}>
        <div className={`
          ${getBackgroundColor()} 
          border-2 rounded-xl p-6 shadow-2xl backdrop-blur-sm
          min-w-[200px] max-w-[300px]
        `}>
          <div className="flex items-center justify-center space-x-3">
            <div className={`
              transition-transform duration-500
              ${animationPhase === 'display' ? 'animate-bounce' : ''}
            `}>
              {getIcon()}
            </div>
            <div className={`font-bold text-lg ${getTextColor()}`}>
              {message}
            </div>
          </div>
          
          {/* 特殊效果文本 */}
          {type === 'perfect' && (
            <div className="text-center mt-2">
              <span className="text-sm font-medium text-yellow-600 animate-pulse">
                ⭐ PERFECT EXECUTION! ⭐
              </span>
            </div>
          )}
          
          {type === 'combo' && (
            <div className="text-center mt-2">
              <span className="text-sm font-medium text-blue-600 animate-pulse">
                🔥 COMBO STREAK! 🔥
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 粒子效果 */}
      {particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-40">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute animate-ping"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(${particle.x}px, ${particle.y}px)`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color,
                borderRadius: '50%',
                animationDuration: '1.5s',
                animationTimingFunction: 'ease-out'
              }}
            />
          ))}
        </div>
      )}

      {/* 背景遮罩（可选） */}
      {(type === 'perfect' || type === 'combo') && (
        <div className={`
          fixed inset-0 pointer-events-none z-30
          ${animationPhase === 'display' ? 'bg-black bg-opacity-10' : 'bg-transparent'}
          transition-all duration-300
        `} />
      )}
    </>
  );
};

// 操作反馈管理器
interface FeedbackManagerProps {
  children: React.ReactNode;
}

interface FeedbackItem {
  id: number;
  type: 'success' | 'warning' | 'error' | 'perfect' | 'combo';
  message: string;
  duration?: number;
}

export const FeedbackManager: React.FC<FeedbackManagerProps> = ({ children }) => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [nextId, setNextId] = useState(1);

  const showFeedback = (type: FeedbackItem['type'], message: string, duration?: number) => {
    const newFeedback: FeedbackItem = {
      id: nextId,
      type,
      message,
      duration
    };
    
    setFeedbacks(prev => [...prev, newFeedback]);
    setNextId(prev => prev + 1);
  };

  const removeFeedback = (id: number) => {
    setFeedbacks(prev => prev.filter(f => f.id !== id));
  };

  // 将showFeedback函数通过Context或其他方式提供给子组件使用
  React.useEffect(() => {
    (window as any).showOperationFeedback = showFeedback;
    return () => {
      delete (window as any).showOperationFeedback;
    };
  }, []);

  return (
    <>
      {children}
      {feedbacks.map((feedback) => (
        <OperationFeedback
          key={feedback.id}
          type={feedback.type}
          message={feedback.message}
          duration={feedback.duration}
          onComplete={() => removeFeedback(feedback.id)}
        />
      ))}
    </>
  );
};

export default OperationFeedback;