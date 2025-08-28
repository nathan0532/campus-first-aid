import React, { useState, useEffect } from 'react';
import { ArrowDown, ArrowRight, ArrowUp, ArrowLeft, Target, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface GuideStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string; // CSS selector
  position?: 'top' | 'bottom' | 'left' | 'right';
  arrow?: 'up' | 'down' | 'left' | 'right';
  isOptional?: boolean;
  timeLimit?: number; // 秒数
}

interface SmartGuideProps {
  currentStep: string;
  completedActions: string[];
  onActionComplete?: (action: string) => void;
  className?: string;
}

interface OperationQuality {
  speed: 'fast' | 'normal' | 'slow';
  accuracy: 'perfect' | 'good' | 'needs_improvement';
  technique: 'excellent' | 'adequate' | 'incorrect';
}

const SmartGuide: React.FC<SmartGuideProps> = ({
  currentStep,
  completedActions,
  onActionComplete,
  className = ''
}) => {
  const [activeGuides, setActiveGuides] = useState<GuideStep[]>([]);
  const [operationQuality, setOperationQuality] = useState<OperationQuality>({
    speed: 'normal',
    accuracy: 'good',
    technique: 'adequate'
  });
  const [showQualityFeedback, setShowQualityFeedback] = useState(false);
  const [stepStartTime, setStepStartTime] = useState<number>(Date.now());

  // 定义各步骤的指导信息
  const guideSteps: Record<string, GuideStep[]> = {
    'check-consciousness': [
      {
        id: 'tap-shoulder',
        title: 'Tap Patient\'s Shoulders',
        description: 'Firmly tap both shoulders and shout "Are you okay?"',
        targetElement: '.shoulder-area',
        position: 'top',
        arrow: 'down',
        timeLimit: 10
      },
      {
        id: 'check-response',
        title: 'Check for Response',
        description: 'Look for any movement, eye opening, or verbal response',
        position: 'bottom',
        timeLimit: 5
      }
    ],
    'call-help': [
      {
        id: 'call-emergency',
        title: 'Call Emergency Services',
        description: 'Call 911 or local emergency number immediately',
        targetElement: '.emergency-button',
        position: 'top',
        arrow: 'down',
        timeLimit: 15
      },
      {
        id: 'request-aed',
        title: 'Request AED',
        description: 'Ask someone to find and bring an AED if available',
        position: 'bottom',
        isOptional: true
      }
    ],
    'position': [
      {
        id: 'position-head',
        title: 'Position the Head',
        description: 'Tilt head back slightly and lift chin to open airway',
        targetElement: '.head-area',
        position: 'top',
        arrow: 'down',
        timeLimit: 8
      },
      {
        id: 'check-airway',
        title: 'Check Airway',
        description: 'Look for visible obstructions in the mouth',
        position: 'bottom',
        timeLimit: 5
      }
    ],
    'compression': [
      {
        id: 'hand-position',
        title: 'Correct Hand Position',
        description: 'Place heel of one hand on center of chest, other hand on top',
        targetElement: '.chest-area',
        position: 'left',
        arrow: 'right',
        timeLimit: 10
      },
      {
        id: 'compression-depth',
        title: 'Compression Depth',
        description: 'Push hard and fast at least 2 inches (5cm) deep',
        position: 'top',
        timeLimit: 30
      },
      {
        id: 'compression-rate',
        title: 'Compression Rate',
        description: 'Maintain 100-120 compressions per minute',
        position: 'bottom'
      }
    ],
    'ventilation': [
      {
        id: 'head-tilt',
        title: 'Head Tilt Chin Lift',
        description: 'Ensure airway is open before giving breaths',
        targetElement: '.head-area',
        position: 'top',
        arrow: 'down',
        timeLimit: 5
      },
      {
        id: 'seal-mouth',
        title: 'Create Seal',
        description: 'Pinch nose and create seal over mouth',
        position: 'right',
        timeLimit: 5
      },
      {
        id: 'give-breaths',
        title: 'Give Rescue Breaths',
        description: 'Give 2 breaths, each lasting 1 second',
        targetElement: '.mouth-area',
        position: 'bottom',
        arrow: 'up',
        timeLimit: 10
      }
    ]
  };

  // 更新当前步骤的指导
  useEffect(() => {
    const guides = guideSteps[currentStep] || [];
    setActiveGuides(guides);
    setStepStartTime(Date.now());
  }, [currentStep]);

  // 分析操作质量
  const analyzeOperationQuality = (action: string, timeSpent: number) => {
    const guide = activeGuides.find(g => g.id === action);
    if (!guide) return;

    let speed: OperationQuality['speed'] = 'normal';
    let accuracy: OperationQuality['accuracy'] = 'good';

    // 分析速度
    if (guide.timeLimit) {
      if (timeSpent < guide.timeLimit * 0.5) {
        speed = 'fast';
      } else if (timeSpent > guide.timeLimit * 1.5) {
        speed = 'slow';
      }
    }

    // 模拟准确性评估 (实际中可以基于鼠标位置、点击区域等)
    const accuracyScore = Math.random();
    if (accuracyScore > 0.9) {
      accuracy = 'perfect';
    } else if (accuracyScore < 0.6) {
      accuracy = 'needs_improvement';
    }

    setOperationQuality(prev => ({ ...prev, speed, accuracy }));
    setShowQualityFeedback(true);

    // 3秒后隐藏反馈
    setTimeout(() => setShowQualityFeedback(false), 3000);
  };

  // 获取箭头图标
  const getArrowIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <ArrowUp className="h-4 w-4" />;
      case 'down': return <ArrowDown className="h-4 w-4" />;
      case 'left': return <ArrowLeft className="h-4 w-4" />;
      case 'right': return <ArrowRight className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  // 获取质量反馈颜色
  const getQualityColor = (aspect: keyof OperationQuality) => {
    const value = operationQuality[aspect];
    if (aspect === 'speed') {
      return value === 'normal' ? 'text-green-600' :
             value === 'fast' ? 'text-orange-600' : 'text-red-600';
    }
    if (aspect === 'accuracy') {
      return value === 'perfect' ? 'text-green-600' :
             value === 'good' ? 'text-blue-600' : 'text-red-600';
    }
    if (aspect === 'technique') {
      return value === 'excellent' ? 'text-green-600' :
             value === 'adequate' ? 'text-yellow-600' : 'text-red-600';
    }
    return 'text-gray-600';
  };

  // 处理操作完成
  const handleActionComplete = (actionId: string) => {
    const timeSpent = (Date.now() - stepStartTime) / 1000;
    analyzeOperationQuality(actionId, timeSpent);
    onActionComplete?.(actionId);
  };

  const incompleteGuides = activeGuides.filter(guide => 
    !completedActions.includes(guide.id)
  );

  if (incompleteGuides.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 主要指导提示 */}
      <div className="bg-white rounded-lg shadow-lg border-l-4 border-blue-500 p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Target className="h-6 w-6 text-blue-500 mt-1" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">Next Steps</h3>
            <div className="space-y-3">
              {incompleteGuides.map((guide, index) => (
                <div
                  key={guide.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${
                    index === 0 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {index === 0 ? (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                    ) : guide.isOptional ? (
                      <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">?</span>
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 text-xs">{index + 1}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className={`font-medium ${
                        index === 0 ? 'text-blue-900' : 'text-gray-700'
                      }`}>
                        {guide.title}
                      </h4>
                      {guide.arrow && (
                        <div className={`${index === 0 ? 'text-blue-500' : 'text-gray-400'}`}>
                          {getArrowIcon(guide.arrow)}
                        </div>
                      )}
                      {guide.timeLimit && (
                        <div className="flex items-center text-xs text-orange-600">
                          <Clock className="h-3 w-3 mr-1" />
                          {guide.timeLimit}s
                        </div>
                      )}
                    </div>
                    <p className={`text-sm ${
                      index === 0 ? 'text-blue-800' : 'text-gray-600'
                    }`}>
                      {guide.description}
                    </p>
                    {guide.isOptional && (
                      <span className="inline-block mt-1 px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                        Optional
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 操作质量反馈 */}
      {showQualityFeedback && (
        <div className="bg-white rounded-lg shadow-lg border p-4 transition-all duration-300">
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <h4 className="font-semibold text-gray-900">Operation Feedback</h4>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Speed</div>
              <div className={`font-semibold capitalize ${getQualityColor('speed')}`}>
                {operationQuality.speed}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Accuracy</div>
              <div className={`font-semibold capitalize ${getQualityColor('accuracy')}`}>
                {operationQuality.accuracy}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Technique</div>
              <div className={`font-semibold capitalize ${getQualityColor('technique')}`}>
                {operationQuality.technique}
              </div>
            </div>
          </div>

          {/* 改进建议 */}
          {(operationQuality.speed === 'slow' || operationQuality.accuracy === 'needs_improvement') && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-xs text-yellow-800">
                  {operationQuality.speed === 'slow' && (
                    <p>Try to perform actions more quickly to maintain effectiveness.</p>
                  )}
                  {operationQuality.accuracy === 'needs_improvement' && (
                    <p>Focus on precision - accurate placement is crucial for success.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 进度指示器 */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Step Progress</span>
          <span className="font-medium text-gray-900">
            {completedActions.length} / {activeGuides.length} completed
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(completedActions.length / activeGuides.length) * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SmartGuide;