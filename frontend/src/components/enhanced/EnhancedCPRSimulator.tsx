import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Play, RotateCcw, CheckCircle, HelpCircle, Clock } from 'lucide-react';
import QuizModal from '../common/QuizModal';
import VideoPlayer from '../common/VideoPlayer';
import PatientStatusIndicator from './PatientStatusIndicator';
import { FeedbackManager } from './OperationFeedback';
import SmartGuide from './SmartGuide';
import GameElements, { calculateScore } from './GameElements';
import EnhancedTrainingProgress from './EnhancedTrainingProgress';
import { useAudioContext } from './AudioManager';
import { playGeneratedSound } from '../../utils/audioGenerator';
import { cprQuestions, QuizQuestion } from '../../data/cprQuestions';

interface CPRStep {
  id: string;
  name: string;
  description: string;
  instruction: string;
  requiredActions: string[];
  timeLimit?: number;
  points: number;
}

interface StepResult {
  stepId: string;
  completed: boolean;
  timeSpent: number;
  attempts: number;
  score: number;
  quizScore?: number;
  accuracy: number;
  speed: number;
  technique: number;
}

interface PatientState {
  consciousness: 'conscious' | 'unconscious' | 'responding';
  heartRate: number;
  breathing: 'normal' | 'weak' | 'none';
  pulse: 'strong' | 'weak' | 'none';
}

const EnhancedCPRSimulator: React.FC = () => {
  const audioContext = useAudioContext();
  
  const [trainingPhase, setTrainingPhase] = useState<'knowledge' | 'instruction' | 'practice'>('knowledge');
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStartTime, setStepStartTime] = useState(Date.now());
  const [stepResults, setStepResults] = useState<StepResult[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [compressionCount, setCompressionCount] = useState(0);
  const [compressionRate, setCompressionRate] = useState(0);
  const [ventilationCount, setVentilationCount] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null);
  const [, setKnowledgeTestResults] = useState<{[stepId: string]: {correct: boolean, score: number}}>({});
  const [, setCurrentStepQuestions] = useState<QuizQuestion[]>([]);
  const [, setCurrentQuestionIndex] = useState(0);
  const [totalTimeLeft, setTotalTimeLeft] = useState(5 * 60);
  const [trainingStarted, setTrainingStarted] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  
  // 增强功能状态
  const [patientState, setPatientState] = useState<PatientState>({
    consciousness: 'unconscious',
    heartRate: 0,
    breathing: 'none',
    pulse: 'none'
  });
  const [gameScore, setGameScore] = useState({
    totalScore: 0,
    accuracy: 0,
    speed: 0,
    technique: 0,
    bonus: 0
  });
  const [actionHistory, setActionHistory] = useState<Array<{accuracy: number, speed: number, technique: number}>>([]);

  const steps: CPRStep[] = [
    {
      id: 'check-consciousness',
      name: 'Check Consciousness',
      description: 'Tap patient\'s shoulders and shout loudly',
      instruction: 'Click on patient\'s shoulder to check consciousness response',
      requiredActions: ['tap-shoulder', 'shout'],
      timeLimit: 15,
      points: 100
    },
    {
      id: 'call-help',
      name: 'Call for Help',
      description: 'Call emergency services and request assistance',
      instruction: 'Call emergency services (911) and ask for help',
      requiredActions: ['call-help', 'call-120'],
      timeLimit: 20,
      points: 100
    },
    {
      id: 'position',
      name: 'Position Patient',
      description: 'Position patient and open airway',
      instruction: 'Tilt head back and lift chin to open the airway',
      requiredActions: ['position-head', 'open-airway'],
      timeLimit: 15,
      points: 100
    },
    {
      id: 'compression',
      name: 'Chest Compressions',
      description: 'Perform 30 chest compressions',
      instruction: 'Place hands on center of chest and compress 2 inches deep',
      requiredActions: ['position-hands', 'chest-compression'],
      timeLimit: 20,
      points: 200
    },
    {
      id: 'ventilation',
      name: 'Rescue Breathing',
      description: 'Give 2 rescue breaths',
      instruction: 'Tilt head, lift chin, and give 2 rescue breaths',
      requiredActions: ['head-tilt', 'rescue-breath'],
      timeLimit: 15,
      points: 100
    }
  ];

  const videoMapping = {
    'check-consciousness': '/videos/cpr/check-consciousness.mp4',
    'call-help': '/videos/cpr/call-help.mp4',
    'position': '/videos/cpr/position-patient.mp4',
    'compression': '/videos/cpr/chest-compression.mp4',
    'ventilation': '/videos/cpr/rescue-breathing.mp4'
  };

  // 总体倒计时
  useEffect(() => {
    if (!trainingStarted || timeExpired) return;

    if (totalTimeLeft <= 0) {
      setTimeExpired(true);
      setTimeout(() => {
        window.location.href = '/results';
      }, 3000);
      return;
    }

    const timer = setTimeout(() => {
      setTotalTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [totalTimeLeft, trainingStarted, timeExpired]);

  // 胸部按压计数和频率计算
  useEffect(() => {
    if (currentStep === 3 && isActive) { // compression step
      const interval = setInterval(() => {
        if (compressionCount > 0) {
          const timeElapsed = (Date.now() - stepStartTime) / 1000 / 60; // 分钟
          const rate = Math.round(compressionCount / timeElapsed);
          setCompressionRate(rate);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [compressionCount, stepStartTime, currentStep, isActive]);

  // 更新患者状态基于训练进度
  useEffect(() => {
    const updatePatientState = () => {
      const currentStepData = steps[currentStep];
      
      if (currentStepData.id === 'check-consciousness') {
        setPatientState({
          consciousness: 'unconscious',
          heartRate: 0,
          breathing: 'none',
          pulse: 'none'
        });
      } else if (currentStepData.id === 'compression' && compressionCount > 0) {
        // 按压开始后患者状态改善
        const effectiveCompressions = Math.min(compressionCount, 30);
        const improvementRatio = effectiveCompressions / 30;
        
        setPatientState({
          consciousness: improvementRatio > 0.7 ? 'responding' : 'unconscious',
          heartRate: Math.round(60 + improvementRatio * 40), // 60-100 BPM
          breathing: improvementRatio > 0.5 ? 'weak' : 'none',
          pulse: improvementRatio > 0.3 ? 'weak' : 'none'
        });
      }
    };

    updatePatientState();
  }, [currentStep, compressionCount, steps]);

  // 更新游戏分数
  useEffect(() => {
    if (actionHistory.length > 0) {
      const newScore = calculateScore.overall(actionHistory);
      setGameScore(newScore);
    }
  }, [actionHistory]);

  const handleAction = useCallback((action: string) => {
    const currentStepData = steps[currentStep];
    const timeSpent = (Date.now() - stepStartTime) / 1000;
    
    // 计算操作质量
    const speedScore = currentStepData.timeLimit ? 
      Math.max(0, 1 - (timeSpent / currentStepData.timeLimit)) : 1;
    const accuracyScore = Math.random() * 0.3 + 0.7; // 模拟准确性 70-100%
    const techniqueScore = Math.random() * 0.4 + 0.6; // 模拟技术 60-100%

    // 添加到动作历史
    setActionHistory(prev => [...prev, {
      accuracy: accuracyScore,
      speed: speedScore,
      technique: techniqueScore
    }]);

    // 播放音效
    if (accuracyScore > 0.9) {
      audioContext.playSound('perfect');
      playGeneratedSound.perfect();
      (window as any).showOperationFeedback?.('perfect', 'Perfect!');
    } else if (accuracyScore > 0.7) {
      audioContext.playSound('success');
      playGeneratedSound.success();
      (window as any).showOperationFeedback?.('success', 'Good!');
    } else {
      audioContext.playSound('warning');
      playGeneratedSound.error();
      (window as any).showOperationFeedback?.('warning', 'Try Again!');
    }

    // 特定动作处理
    if (action === 'chest-compression') {
      setCompressionCount(prev => prev + 1);
      audioContext.playSound('compression');
      playGeneratedSound.compression();
      
      if (compressionCount + 1 >= 30) {
        completeCurrentStep();
      }
    } else if (action === 'rescue-breath') {
      setVentilationCount(prev => prev + 1);
      
      if (ventilationCount + 1 >= 2) {
        completeCurrentStep();
      }
    }

    // 添加到已完成动作
    if (!completedActions.includes(action)) {
      setCompletedActions(prev => [...prev, action]);
    }

    // 检查是否完成了当前步骤的所有必需动作
    const newCompletedActions = [...completedActions, action];
    const allRequiredCompleted = currentStepData.requiredActions.every(
      reqAction => newCompletedActions.includes(reqAction)
    );

    if (allRequiredCompleted) {
      setTimeout(() => completeCurrentStep(), 1000);
    }
  }, [currentStep, stepStartTime, compressionCount, ventilationCount, completedActions, audioContext, steps]);

  const completeCurrentStep = () => {
    const currentStepData = steps[currentStep];
    const timeSpent = (Date.now() - stepStartTime) / 1000;
    
    const stepResult: StepResult = {
      stepId: currentStepData.id,
      completed: true,
      timeSpent,
      attempts: 1,
      score: currentStepData.points,
      accuracy: 85 + Math.random() * 15, // 85-100%
      speed: Math.max(50, 100 - (timeSpent / (currentStepData.timeLimit || 30)) * 50),
      technique: 80 + Math.random() * 20 // 80-100%
    };

    setStepResults(prev => [...prev, stepResult]);
    setCompletedActions([]);

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setStepStartTime(Date.now());
      setTrainingPhase('knowledge'); // 每个新步骤都从知识测试开始
    } else {
      // 训练完成
      setTimeout(() => {
        window.location.href = '/results';
      }, 2000);
    }
  };

  const startKnowledgeTest = () => {
    if (!trainingStarted) {
      setTrainingStarted(true);
    }
    
    const currentStepData = steps[currentStep];
    const stepQuestions = cprQuestions.filter(q => q.stepId === currentStepData.id);
    
    if (stepQuestions.length > 0) {
      setCurrentStepQuestions(stepQuestions);
      setCurrentQuestionIndex(0);
      setCurrentQuiz(stepQuestions[0]);
      setShowQuiz(true);
    } else {
      setTrainingPhase('instruction');
    }
  };

  const handleQuizAnswer = (correct: boolean) => {
    const currentStepData = steps[currentStep];
    
    setKnowledgeTestResults(prev => ({
      ...prev,
      [currentStepData.id]: { correct, score: correct ? 100 : 0 }
    }));

    setShowQuiz(false);
    setCurrentQuiz(null);
    
    // 播放反馈音效
    if (correct) {
      audioContext.playSound('success');
      playGeneratedSound.success();
    } else {
      audioContext.playSound('error');
      playGeneratedSound.error();
    }

    // 延迟进入指导阶段
    setTimeout(() => {
      setTrainingPhase('instruction');
    }, 1000);
  };

  const startPracticePhase = () => {
    setTrainingPhase('practice');
    setIsActive(true);
    setStepStartTime(Date.now());
  };

  const resetSimulation = () => {
    setCurrentStep(0);
    setTrainingPhase('knowledge');
    setStepResults([]);
    setIsActive(false);
    setCompressionCount(0);
    setCompressionRate(0);
    setVentilationCount(0);
    setShowQuiz(false);
    setCurrentQuiz(null);
    setKnowledgeTestResults({});
    setTrainingStarted(false);
    setTimeExpired(false);
    setTotalTimeLeft(5 * 60);
    setCompletedActions([]);
    setActionHistory([]);
    setGameScore({ totalScore: 0, accuracy: 0, speed: 0, technique: 0, bonus: 0 });
    setPatientState({
      consciousness: 'unconscious',
      heartRate: 0,
      breathing: 'none',
      pulse: 'none'
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentStepData = steps[currentStep];

  return (
    <FeedbackManager>
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：主要训练区域 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Enhanced CPR Training</h2>
                  {(showQuiz || trainingPhase === 'instruction' || isActive) && (
                    <p className="text-sm text-gray-600 mt-1">
                      {trainingPhase === 'knowledge' ? 'Knowledge Test Phase' : 
                       trainingPhase === 'instruction' ? 'Instruction Phase' : 'Practice Phase'} - Step {currentStep + 1} / {steps.length}
                    </p>
                  )}
                </div>
                
                {!timeExpired ? (
                  <div className="flex items-center space-x-4">
                    {trainingPhase === 'knowledge' && !showQuiz ? (
                      <button
                        onClick={startKnowledgeTest}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Start Knowledge Test
                      </button>
                    ) : trainingPhase === 'instruction' ? (
                      <button
                        onClick={startPracticePhase}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Practice
                      </button>
                    ) : (
                      <button
                        onClick={resetSimulation}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </button>
                    )}
                  </div>
                ) : null}
              </div>

              {/* 时间显示 */}
              {trainingStarted && !timeExpired && (
                <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  totalTimeLeft <= 60 ? 'bg-red-100 text-red-700' : 
                  totalTimeLeft <= 120 ? 'bg-yellow-100 text-yellow-700' : 
                  'bg-green-100 text-green-700'
                }`}>
                  <Clock className="h-4 w-4 mr-2" />
                  Time Remaining: {formatTime(totalTimeLeft)}
                </div>
              )}
            </div>

            {/* 患者状态指示器 */}
            <PatientStatusIndicator
              consciousness={patientState.consciousness}
              heartRate={patientState.heartRate}
              breathing={patientState.breathing}
              pulse={patientState.pulse}
            />

            {/* 主要内容区域 */}
            <div className="bg-white rounded-lg shadow p-6">
              {trainingPhase === 'instruction' && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Step {currentStep + 1}: {currentStepData.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{currentStepData.description}</p>
                  
                  <VideoPlayer
                    src={videoMapping[currentStepData.id as keyof typeof videoMapping]}
                    title={currentStepData.name}
                    className="mb-4"
                  />
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 font-medium">Instructions:</p>
                    <p className="text-blue-700">{currentStepData.instruction}</p>
                  </div>
                </div>
              )}

              {/* 交互式训练区域 */}
              <div className="bg-gray-100 rounded-xl p-8 min-h-96 relative">
                {trainingPhase === 'practice' && isActive ? (
                  <EnhancedInteractiveArea 
                    step={currentStepData}
                    onAction={handleAction}
                    completedActions={completedActions}
                    compressionCount={compressionCount}
                    ventilationCount={ventilationCount}
                    compressionRate={compressionRate}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      {trainingPhase === 'knowledge' ? (
                        <>
                          <HelpCircle className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">Knowledge Test Phase</p>
                          <p className="text-gray-500">
                            {showQuiz ? 'Answer the question to proceed' : 'Click "Start Knowledge Test" to begin'}
                          </p>
                        </>
                      ) : trainingPhase === 'instruction' ? (
                        <>
                          <CheckCircle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">Instructions Ready</p>
                          <p className="text-gray-500">Review the instructions above, then click "Start Practice" when ready</p>
                        </>
                      ) : (
                        <>
                          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">Practice Phase</p>
                          <p className="text-gray-500">Click "Start Practice" to begin hands-on training</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧：增强功能面板 */}
          <div className="space-y-6">
            {/* 游戏化分数 */}
            <GameElements
              currentScore={gameScore}
              onScoreUpdate={setGameScore}
            />

            {/* 智能指导 */}
            {trainingPhase === 'practice' && (
              <SmartGuide
                currentStep={currentStepData.id}
                completedActions={completedActions}
                onActionComplete={(action) => console.log('Action completed:', action)}
              />
            )}

            {/* 增强训练进度 */}
            <EnhancedTrainingProgress
              steps={steps}
              currentStep={currentStep}
              completedSteps={stepResults.map(result => result.stepId)}
              videoMapping={videoMapping}
            />
          </div>
        </div>

        {/* Quiz Modal */}
        {showQuiz && currentQuiz && (
          <QuizModal
            isOpen={showQuiz}
            question={currentQuiz}
            onClose={() => setShowQuiz(false)}
            onAnswer={handleQuizAnswer}
            timeLimit={15}
          />
        )}
      </div>
    </FeedbackManager>
  );
};

// 增强的交互区域组件
interface EnhancedInteractiveAreaProps {
  step: CPRStep;
  onAction: (action: string) => void;
  completedActions: string[];
  compressionCount: number;
  ventilationCount: number;
  compressionRate: number;
}

const EnhancedInteractiveArea: React.FC<EnhancedInteractiveAreaProps> = ({
  step,
  onAction,
  completedActions,
  compressionCount,
  ventilationCount,
  compressionRate
}) => {
  const isActionCompleted = (action: string) => completedActions.includes(action);

  return (
    <div className="text-center">
      <div className="relative inline-block mb-6">
        <div className="w-80 h-80 bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg mx-auto flex items-center justify-center relative shadow-lg">
          <span className="text-blue-800 font-medium text-lg">Emergency Patient</span>
          
          {/* 根据步骤显示不同的交互元素 */}
          {step.id === 'check-consciousness' && (
            <button
              onClick={() => onAction('tap-shoulder')}
              className={`absolute top-16 left-20 w-20 h-12 rounded-lg transition-all transform hover:scale-105 ${
                isActionCompleted('tap-shoulder') 
                  ? 'bg-green-500 text-white shadow-lg' 
                  : 'bg-yellow-400 hover:bg-yellow-500 shadow-md'
              }`}
            >
              {isActionCompleted('tap-shoulder') ? '✓' : 'Shoulder'}
            </button>
          )}
          
          {step.id === 'compression' && (
            <button
              onClick={() => onAction('chest-compression')}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-lg bg-red-400 hover:bg-red-500 transition-all hover:scale-110 text-white font-bold shadow-lg"
            >
              Press
            </button>
          )}
          
          {step.id === 'ventilation' && (
            <button
              onClick={() => onAction('rescue-breath')}
              className="absolute top-12 left-1/2 transform -translate-x-1/2 w-16 h-8 rounded-full bg-pink-400 hover:bg-pink-500 transition-all text-white text-sm font-medium shadow-md"
            >
              Mouth
            </button>
          )}
        </div>
      </div>

      {/* 步骤特定的统计信息 */}
      {step.id === 'compression' && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-3xl font-bold text-blue-600">{compressionCount}</div>
            <div className="text-sm text-gray-600">Compressions</div>
            <div className="text-xs text-gray-500">Target: 30</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className={`text-3xl font-bold ${
              compressionCount > 0 && compressionRate >= 100 && compressionRate <= 120 
                ? 'text-green-600' 
                : 'text-orange-600'
            }`}>
              {compressionCount > 0 ? Math.round((compressionCount / ((Date.now() - Date.now()) / 60000)) || 100) : 0}
            </div>
            <div className="text-sm text-gray-600">Rate/min</div>
            <div className="text-xs text-gray-500">Target: 100-120</div>
          </div>
        </div>
      )}

      {step.id === 'ventilation' && (
        <div className="bg-white p-4 rounded-lg shadow mt-4">
          <div className="text-3xl font-bold text-blue-600">{ventilationCount}</div>
          <div className="text-sm text-gray-600">Rescue Breaths</div>
          <div className="text-xs text-gray-500">Target: 2</div>
        </div>
      )}
    </div>
  );
};

export default EnhancedCPRSimulator;