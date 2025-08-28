import React, { useState, useEffect } from 'react';
import { Heart, Play, Pause, RotateCcw, CheckCircle, AlertCircle, HelpCircle, Clock } from 'lucide-react';
import QuizModal from '../common/QuizModal';
import VideoPlayer from '../common/VideoPlayer';
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
}

const CPRSimulator: React.FC = () => {
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
  const [knowledgeTestResults, setKnowledgeTestResults] = useState<{[stepId: string]: {correct: boolean, score: number}}>({});
  const [currentStepQuestions, setCurrentStepQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [canShowInstructions, setCanShowInstructions] = useState(false);
  const [totalTimeLeft, setTotalTimeLeft] = useState(5 * 60); // 5分钟 = 300秒
  const [trainingStarted, setTrainingStarted] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);

  const steps: CPRStep[] = [
    {
      id: 'check-consciousness',
      name: 'Check Consciousness',
      description: 'Tap patient\'s shoulders and shout loudly',
      instruction: 'Click on patient\'s shoulder to check consciousness response',
      requiredActions: ['tap-shoulder', 'shout'],
      timeLimit: 30,
      points: 20
    },
    {
      id: 'call-help',
      name: 'Call for Help',
      description: 'Immediately call for help and dial emergency services',
      instruction: 'Click call for help button and dial emergency number',
      requiredActions: ['call-help', 'call-120'],
      timeLimit: 30,
      points: 20
    },
    {
      id: 'position',
      name: 'Position Patient',
      description: 'Place patient supine, tilt head back to open airway',
      instruction: 'Drag to adjust patient\'s head position, ensure airway is clear',
      requiredActions: ['position-head', 'open-airway'],
      timeLimit: 45,
      points: 20
    },
    {
      id: 'compression',
      name: 'Chest Compressions',
      description: '30 chest compressions, depth 5-6cm',
      instruction: 'Press on lower half of breastbone, maintain rate of 100-120 compressions/minute',
      requiredActions: ['chest-compression-30'],
      timeLimit: 120,
      points: 25
    },
    {
      id: 'ventilation',
      name: 'Rescue Breathing',
      description: '2 rescue breaths',
      instruction: 'Ensure head is tilted back, perform 2 effective ventilations',
      requiredActions: ['mouth-to-mouth-2'],
      timeLimit: 60,
      points: 15
    }
  ];

  const [completedActions, setCompletedActions] = useState<string[]>([]);

  // 视频路径配置
  const getVideoPath = (stepId: string): string => {
    const videoMap: { [key: string]: string } = {
      'check-consciousness': '/videos/cpr/check-consciousness.mp4',
      'call-help': '/videos/cpr/call-help.mp4',
      'position': '/videos/cpr/position-patient.mp4',
      'compression': '/videos/cpr/chest-compression.mp4',
      'ventilation': '/videos/cpr/rescue-breathing.mp4'
    };
    return videoMap[stepId] || '';
  };

  useEffect(() => {
    if (isActive) {
      setStepStartTime(Date.now());
    }
  }, [currentStep, isActive]);

  // 总体倒计时
  useEffect(() => {
    if (!trainingStarted || timeExpired) return;

    if (totalTimeLeft <= 0) {
      setTimeExpired(true);
      // 时间到，强制完成训练
      setTimeout(() => {
        const totalScore = stepResults.reduce((sum, result) => sum + result.score, 0);
        const totalQuizScore = stepResults.reduce((sum, result) => sum + (result.quizScore || 0), 0);
        window.location.href = `/results?type=cpr&score=${totalScore}&quizScore=${totalQuizScore}&timeExpired=true`;
      }, 3000);
      return;
    }

    const timer = setTimeout(() => {
      setTotalTimeLeft(totalTimeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [totalTimeLeft, trainingStarted, timeExpired, stepResults]);

  const handleAction = (action: string) => {
    if (!isActive) return;

    const newCompletedActions = [...completedActions, action];
    setCompletedActions(newCompletedActions);

    // 特殊处理胸外按压
    if (action === 'chest-compression') {
      const newCount = compressionCount + 1;
      setCompressionCount(newCount);
      
      // 计算按压频率
      const timeElapsed = (Date.now() - stepStartTime) / 1000;
      const rate = Math.round((newCount / timeElapsed) * 60);
      setCompressionRate(rate);

      if (newCount >= 30) {
        if (!newCompletedActions.includes('chest-compression-30')) {
          setCompletedActions([...newCompletedActions, 'chest-compression-30']);
        }
      }
    }

    // 特殊处理人工呼吸
    if (action === 'mouth-to-mouth') {
      const newCount = ventilationCount + 1;
      setVentilationCount(newCount);

      if (newCount >= 2) {
        if (!newCompletedActions.includes('mouth-to-mouth-2')) {
          setCompletedActions([...newCompletedActions, 'mouth-to-mouth-2']);
        }
      }
    }

    // 检查当前步骤是否完成
    checkStepCompletion(newCompletedActions);
  };

  const checkStepCompletion = (actions: string[]) => {
    const currentStepData = steps[currentStep];
    const allActionsCompleted = currentStepData.requiredActions.every(
      action => actions.includes(action)
    );

    if (allActionsCompleted) {
      completeStep();
    }
  };

  const showQuizForCurrentStep = () => {
    const currentStepData = steps[currentStep];
    const stepQuestions = cprQuestions.filter(q => q.stepId === currentStepData.id);
    
    if (stepQuestions.length > 0) {
      // 随机选择一个问题
      const randomQuestion = stepQuestions[Math.floor(Math.random() * stepQuestions.length)];
      setCurrentQuiz(randomQuestion);
      setShowQuiz(true);
      // setPendingStepCompletion(true);
    } else {
      completeStep();
    }
  };

  const handleQuizAnswer = (correct: boolean) => {
    const currentStepData = steps[currentStep];
    
    if (trainingPhase === 'knowledge') {
      // 知识测试阶段
      const currentResult = knowledgeTestResults[currentStepData.id] || { correct: false, score: 0 };
      const newScore = currentResult.score + (correct ? 5 : 0);
      const hasCorrectAnswer = currentResult.correct || correct;
      
      setKnowledgeTestResults({
        ...knowledgeTestResults,
        [currentStepData.id]: {
          correct: hasCorrectAnswer,
          score: newScore
        }
      });

      // 只有答对了才能显示操作指导
      if (correct) {
        setCanShowInstructions(true);
      }

      setTimeout(() => {
        setShowQuiz(false);
        setCurrentQuiz(null);
        
        // 检查是否还有更多问题
        if (currentQuestionIndex < currentStepQuestions.length - 1) {
          const nextIndex = currentQuestionIndex + 1;
          setCurrentQuestionIndex(nextIndex);
          // 如果答对了，3秒后自动进入下一题；如果答错了，1.5秒后进入下一题
          setTimeout(() => {
            setCurrentQuiz(currentStepQuestions[nextIndex]);
            setShowQuiz(true);
          }, correct ? 3000 : 0);
        } else {
          // 完成当前步骤的知识测试
          if (hasCorrectAnswer || correct) {
            // 如果有正确答案，进入指导阶段
            setTrainingPhase('instruction');
          } else {
            // 如果没有答对任何问题，重新开始知识测试
            setCurrentQuestionIndex(0);
            setCurrentQuiz(currentStepQuestions[0]);
            setShowQuiz(true);
            setCanShowInstructions(false);
          }
        }
      }, correct ? 3000 : 1500);
    } else {
      // 实践阶段的手动问答 (保留原有逻辑)
      setTimeout(() => {
        setShowQuiz(false);
        setCurrentQuiz(null);
      }, 1500);
    }
  };

  const completeStepWithQuiz = (quizCorrect: boolean) => {
    const timeSpent = (Date.now() - stepStartTime) / 1000;
    const currentStepData = steps[currentStep];
    
    // 计算得分
    let score = currentStepData.points;
    if (currentStepData.timeLimit && timeSpent > currentStepData.timeLimit) {
      score = Math.max(score * 0.7, 0); // 超时扣分
    }

    // 胸外按压特殊评分
    if (currentStepData.id === 'compression') {
      if (compressionRate >= 100 && compressionRate <= 120) {
        score = currentStepData.points;
      } else {
        score = currentStepData.points * 0.8;
      }
    }

    // 问答加分
    const quizScore = quizCorrect ? 5 : 0;
    const totalScore = score + quizScore;

    const stepResult: StepResult = {
      stepId: currentStepData.id,
      completed: true,
      timeSpent: Math.round(timeSpent),
      attempts: 1,
      score: Math.round(totalScore),
      quizScore: quizScore
    };

    setStepResults([...stepResults, stepResult]);

    // 重置当前步骤状态
    setCompletedActions([]);
    setCompressionCount(0);
    setCompressionRate(0);
    setVentilationCount(0);

    // 进入下一步骤或完成训练
    if (currentStep < steps.length - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 1500);
    } else {
      // 训练完成
      setTimeout(() => {
        completeTraining();
      }, 1500);
    }
  };

  const completeStep = () => {
    const timeSpent = (Date.now() - stepStartTime) / 1000;
    const currentStepData = steps[currentStep];
    
    // 计算得分
    let score = currentStepData.points;
    if (currentStepData.timeLimit && timeSpent > currentStepData.timeLimit) {
      score = Math.max(score * 0.7, 0); // 超时扣分
    }

    // 胸外按压特殊评分
    if (currentStepData.id === 'compression') {
      if (compressionRate >= 100 && compressionRate <= 120) {
        score = currentStepData.points;
      } else {
        score = currentStepData.points * 0.8;
      }
    }

    // 获取知识测试分数
    const knowledgeResult = knowledgeTestResults[currentStepData.id];
    const quizScore = knowledgeResult ? knowledgeResult.score : 0;

    const stepResult: StepResult = {
      stepId: currentStepData.id,
      completed: true,
      timeSpent: Math.round(timeSpent),
      attempts: 1,
      score: Math.round(score),
      quizScore: quizScore
    };

    setStepResults([...stepResults, stepResult]);

    // 重置当前步骤状态
    setCompletedActions([]);
    setCompressionCount(0);
    setCompressionRate(0);
    setVentilationCount(0);

    // 进入下一步骤或完成训练
    if (currentStep < steps.length - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 1500);
    } else {
      // 训练完成
      setTimeout(() => {
        completeTraining();
      }, 1500);
    }
  };

  const completeTraining = () => {
    const totalScore = stepResults.reduce((sum, result) => sum + result.score, 0);
    const totalQuizScore = stepResults.reduce((sum, result) => sum + (result.quizScore || 0), 0);
    const finalResult = [...stepResults];
    
    // 这里可以调用API保存训练结果
    console.log('Training completed:', {
      totalScore,
      totalQuizScore,
      steps: finalResult
    });

    // 跳转到结果页面
    window.location.href = `/results?type=cpr&score=${totalScore}&quizScore=${totalQuizScore}`;
  };

  const resetSimulation = () => {
    setTrainingPhase('knowledge');
    setCurrentStep(0);
    setStepResults([]);
    setCompletedActions([]);
    setCompressionCount(0);
    setCompressionRate(0);
    setVentilationCount(0);
    setIsActive(false);
    setShowQuiz(false);
    setCurrentQuiz(null);
    setKnowledgeTestResults({});
    setCurrentStepQuestions([]);
    setCurrentQuestionIndex(0);
    setCanShowInstructions(false);
    setTotalTimeLeft(5 * 60);
    setTrainingStarted(false);
    setTimeExpired(false);
  };

  const startKnowledgeTest = () => {
    if (!trainingStarted) {
      setTrainingStarted(true); // 启动总体计时
    }
    
    const currentStepData = steps[currentStep];
    const stepQuestions = cprQuestions.filter(q => q.stepId === currentStepData.id);
    
    if (stepQuestions.length > 0) {
      setCurrentStepQuestions(stepQuestions);
      setCurrentQuestionIndex(0);
      setCurrentQuiz(stepQuestions[0]);
      setShowQuiz(true);
    } else {
      // 如果没有问题，直接进入指导阶段
      setTrainingPhase('instruction');
    }
  };

  const startPracticePhase = () => {
    setTrainingPhase('practice');
    setIsActive(true);
    setStepStartTime(Date.now());
  };

  const showInstructionPhase = () => {
    setTrainingPhase('instruction');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">CPR Training Simulation</h2>
          {(showQuiz || trainingPhase === 'instruction' || isActive) && (
            <p className="text-sm text-gray-600 mt-1">
              {trainingPhase === 'knowledge' ? 'Knowledge Test Phase' : 
               trainingPhase === 'instruction' ? 'Instruction Phase' : 'Practice Phase'} - Step {currentStep + 1} / {steps.length}
            </p>
          )}
          {/* 总体倒计时显示 */}
          {trainingStarted && !timeExpired && (
            <div className={`flex items-center mt-2 px-3 py-1 rounded-full text-sm font-medium ${
              totalTimeLeft <= 60 ? 'bg-red-100 text-red-700' : 
              totalTimeLeft <= 120 ? 'bg-yellow-100 text-yellow-700' : 
              'bg-green-100 text-green-700'
            }`}>
              <Clock className="h-4 w-4 mr-2" />
              Time Remaining: {formatTime(totalTimeLeft)}
            </div>
          )}
          {timeExpired && (
            <div className="flex items-center mt-2 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
              <AlertCircle className="h-4 w-4 mr-2" />
              Time Expired! Redirecting to results...
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {!timeExpired ? (
            <>
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
              ) : trainingPhase === 'practice' && !isActive ? (
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
            </>
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
      </div>

      {/* Progress Bar */}
      {(showQuiz || trainingPhase === 'instruction' || isActive) && (
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              trainingPhase === 'knowledge' ? 'bg-blue-600' : 
              trainingPhase === 'instruction' ? 'bg-yellow-600' : 'bg-red-600'
            }`}
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
      )}

      {/* Current Step Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
        {(showQuiz || trainingPhase === 'instruction' || isActive) ? (
          <>
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <Heart className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{currentStepData.name}</h3>
                <p className="text-gray-600">{currentStepData.description}</p>
              </div>
            </div>
        
        {trainingPhase === 'knowledge' ? (
          <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <HelpCircle className="h-5 w-5" />
              <p className="font-medium">Knowledge Test Phase</p>
            </div>
            <p className="text-sm">
              Answer questions correctly to unlock the operation instructions.
              {currentStepQuestions.length > 0 && ` (${currentStepQuestions.length} questions)`}
            </p>
            {knowledgeTestResults[currentStepData.id] && (
              <div className="mt-2 text-sm">
                {knowledgeTestResults[currentStepData.id].correct ? (
                  <span className="text-green-700">✅ Knowledge test passed - Score: {knowledgeTestResults[currentStepData.id].score} points</span>
                ) : (
                  <span className="text-red-700">❌ Need to answer correctly to proceed</span>
                )}
              </div>
            )}
          </div>
        ) : trainingPhase === 'instruction' ? (
          <div className="space-y-4">
            <div className="bg-yellow-50 text-yellow-800 px-4 py-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-5 w-5" />
                <p className="font-medium">Operation Instructions</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium">{currentStepData.instruction}</p>
                {currentStepData.timeLimit && (
                  <p className="text-sm">Suggested time: {currentStepData.timeLimit} seconds</p>
                )}
                <div className="bg-yellow-100 p-3 rounded text-sm">
                  <p className="font-medium mb-1">Key Points:</p>
                  <p>{currentStepData.description}</p>
                </div>
              </div>
            </div>
            
            {/* 演示视频 */}
            {getVideoPath(currentStepData.id) && (
              <VideoPlayer
                src={getVideoPath(currentStepData.id)}
                title={`${currentStepData.name} Demonstration`}
                className="max-w-md mx-auto"
              />
            )}
          </div>
        ) : (
          <div className="bg-green-50 text-green-800 px-4 py-3 rounded-lg mb-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-medium">Now practice: {currentStepData.instruction}</p>
                {currentStepData.timeLimit && (
                  <p className="text-sm mt-1">Suggested time: {currentStepData.timeLimit} seconds</p>
                )}
              </div>
              {trainingPhase === 'practice' && cprQuestions.some(q => q.stepId === currentStepData.id) && (
                <button
                  onClick={() => {
                    const stepQuestions = cprQuestions.filter(q => q.stepId === currentStepData.id);
                    if (stepQuestions.length > 0) {
                      const randomQuestion = stepQuestions[Math.floor(Math.random() * stepQuestions.length)];
                      setCurrentQuiz(randomQuestion);
                      setShowQuiz(true);
                    }
                  }}
                  className="ml-4 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  title="Review knowledge"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step-specific feedback */}
        {currentStepData.id === 'compression' && isActive && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{compressionCount}</div>
              <div className="text-sm text-gray-600">Compressions</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className={`text-2xl font-bold ${
                compressionRate >= 100 && compressionRate <= 120 
                  ? 'text-green-600' 
                  : 'text-orange-600'
              }`}>
                {compressionRate}
              </div>
              <div className="text-sm text-gray-600">per minute</div>
            </div>
          </div>
        )}

            {currentStepData.id === 'ventilation' && isActive && (
              <div className="bg-gray-50 p-3 rounded-lg text-center mb-4">
                <div className="text-2xl font-bold text-blue-600">{ventilationCount}</div>
                <div className="text-sm text-gray-600">Ventilations</div>
              </div>
            )}
          </>
        ) : (
          // 初始状态显示
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">CPR Training</h3>
            <p className="text-gray-600 mb-6">
              Learn life-saving CPR techniques through interactive simulation and knowledge testing.
            </p>
            <div className="bg-blue-50 text-blue-800 px-6 py-4 rounded-lg">
              <p className="font-medium mb-2">Training Process:</p>
              <div className="text-sm space-y-1">
                <p>1. 🧠 Knowledge Test - Answer questions correctly to unlock instructions</p>
                <p>2. 📋 Instructions - Review detailed operation steps</p>
                <p>3. 🎯 Practice Session - Hands-on simulation training</p>
                <p>4. 📊 Assessment - Get your combined score and feedback</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Area */}
      <div className="bg-gray-100 rounded-xl p-8 min-h-96 relative">
        {trainingPhase === 'practice' && isActive ? (
          <CPRInteractiveArea 
            step={currentStepData}
            onAction={handleAction}
            completedActions={completedActions}
            compressionCount={compressionCount}
            ventilationCount={ventilationCount}
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

      {/* Quiz Modal */}
      {showQuiz && currentQuiz && (
        <QuizModal
          isOpen={showQuiz}
          question={currentQuiz}
          onClose={() => setShowQuiz(false)}
          onAnswer={handleQuizAnswer}
          timeLimit={5}
        />
      )}
    </div>
  );
};

interface CPRInteractiveAreaProps {
  step: CPRStep;
  onAction: (action: string) => void;
  completedActions: string[];
  compressionCount: number;
  ventilationCount: number;
}

const CPRInteractiveArea: React.FC<CPRInteractiveAreaProps> = ({
  step,
  onAction,
  completedActions,
  compressionCount,
  ventilationCount
}) => {
  const isActionCompleted = (action: string) => completedActions.includes(action);

  switch (step.id) {
    case 'check-consciousness':
      return (
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-64 h-64 bg-blue-200 rounded-lg mb-4 mx-auto flex items-center justify-center relative">
              <span className="text-blue-800 font-medium">患者</span>
              {/* 肩膀区域 */}
              <button
                onClick={() => onAction('tap-shoulder')}
                className={`absolute top-20 left-16 w-16 h-8 rounded ${
                  isActionCompleted('tap-shoulder') 
                    ? 'bg-green-500 text-white' 
                    : 'bg-yellow-400 hover:bg-yellow-500'
                } transition-colors`}
              >
                {isActionCompleted('tap-shoulder') ? <CheckCircle className="h-4 w-4 mx-auto" /> : 'Shoulder'}
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => onAction('shout')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isActionCompleted('shout')
                  ? 'bg-green-500 text-white'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              {isActionCompleted('shout') ? '✓ Called out' : 'Shout "Are you okay?"'}
            </button>
          </div>
        </div>
      );

    case 'call-help':
      return (
        <div className="text-center space-y-6">
          <button
            onClick={() => onAction('call-help')}
            className={`px-8 py-4 rounded-lg font-medium text-lg transition-colors ${
              isActionCompleted('call-help')
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            {isActionCompleted('call-help') ? '✓ Called for help' : 'Call for Help'}
          </button>
          
          <button
            onClick={() => onAction('call-120')}
            className={`px-8 py-4 rounded-lg font-medium text-lg transition-colors ${
              isActionCompleted('call-120')
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isActionCompleted('call-120') ? '✓ Called emergency' : 'Call Emergency'}
          </button>
        </div>
      );

    case 'position':
      return (
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-64 h-64 bg-blue-200 rounded-lg mb-4 mx-auto flex items-center justify-center relative">
              <span className="text-blue-800 font-medium">患者</span>
              {/* 头部区域 */}
              <button
                onClick={() => onAction('position-head')}
                className={`absolute top-8 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full ${
                  isActionCompleted('position-head') 
                    ? 'bg-green-500 text-white' 
                    : 'bg-yellow-400 hover:bg-yellow-500'
                } transition-colors`}
              >
                {isActionCompleted('position-head') ? <CheckCircle className="h-5 w-5 mx-auto" /> : '头'}
              </button>
            </div>
          </div>
          
          <button
            onClick={() => onAction('open-airway')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              isActionCompleted('open-airway')
                ? 'bg-green-500 text-white'
                : 'bg-purple-500 text-white hover:bg-purple-600'
            }`}
          >
            {isActionCompleted('open-airway') ? '✓ Airway opened' : 'Open Airway'}
          </button>
        </div>
      );

    case 'compression':
      return (
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="w-64 h-64 bg-blue-200 rounded-lg mx-auto flex items-center justify-center relative">
              <span className="text-blue-800 font-medium">患者</span>
              {/* 胸部按压区域 */}
              <button
                onClick={() => onAction('chest-compression')}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded bg-red-400 hover:bg-red-500 transition-colors flex items-center justify-center text-white font-bold"
              >
                Press
              </button>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              Target: 30 compressions | Current: {compressionCount}/30
              <br />
              Maintain rate 100-120 per minute
            </p>
          </div>
        </div>
      );

    case 'ventilation':
      return (
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="w-64 h-64 bg-blue-200 rounded-lg mx-auto flex items-center justify-center relative">
              <span className="text-blue-800 font-medium">患者</span>
              {/* 口部区域 */}
              <button
                onClick={() => onAction('mouth-to-mouth')}
                className="absolute top-16 left-1/2 transform -translate-x-1/2 w-12 h-8 rounded bg-pink-400 hover:bg-pink-500 transition-colors flex items-center justify-center text-white text-sm"
              >
                口
              </button>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              Target: 2 rescue breaths | Current: {ventilationCount}/2
              <br />
              Ensure chest rises and falls
            </p>
          </div>
        </div>
      );

    default:
      return <div>Unknown step</div>;
  }
};

export default CPRSimulator;