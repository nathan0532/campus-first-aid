import React, { useState, useEffect } from 'react';
import { Users, Play, RotateCcw, CheckCircle, AlertTriangle, HelpCircle, Clock, AlertCircle } from 'lucide-react';
import QuizModal from '../common/QuizModal';
import VideoPlayer from '../common/VideoPlayer';
import { heimlichQuestions, QuizQuestion } from '../../data/heimlichQuestions';

interface HeimlichStep {
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

const HeimlichSimulator: React.FC = () => {
  const [trainingPhase, setTrainingPhase] = useState<'knowledge' | 'instruction' | 'practice'>('knowledge');
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStartTime, setStepStartTime] = useState(Date.now());
  const [stepResults, setStepResults] = useState<StepResult[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [thrustCount, setThrustCount] = useState(0);
  const [handPosition, setHandPosition] = useState<{x: number, y: number} | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null);
  const [knowledgeTestResults, setKnowledgeTestResults] = useState<{[stepId: string]: {correct: boolean, score: number}}>({});
  const [currentStepQuestions, setCurrentStepQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [canShowInstructions, setCanShowInstructions] = useState(false);
  const [totalTimeLeft, setTotalTimeLeft] = useState(7 * 60); // 7分钟 = 420秒
  const [trainingStarted, setTrainingStarted] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);

  const steps: HeimlichStep[] = [
    {
      id: 'identify-choking',
      name: 'Identify Choking',
      description: 'Observe patient symptoms, confirm if choking',
      instruction: 'Click to identify choking symptoms',
      requiredActions: ['check-breathing', 'identify-signs'],
      timeLimit: 30,
      points: 25
    },
    {
      id: 'position-behind',
      name: 'Position Behind',
      description: 'Stand behind patient, wrap arms around',
      instruction: 'Click the correct standing position',
      requiredActions: ['stand-behind', 'arms-around'],
      timeLimit: 20,
      points: 25
    },
    {
      id: 'hand-position',
      name: 'Hand Position',
      description: 'Make a fist, position two fingers above navel',
      instruction: 'Drag hand to correct position',
      requiredActions: ['make-fist', 'position-hands'],
      timeLimit: 30,
      points: 25
    },
    {
      id: 'abdominal-thrust',
      name: 'Abdominal Thrusts',
      description: 'Quick thrusts inward and upward',
      instruction: 'Perform 5 forceful abdominal thrusts',
      requiredActions: ['thrust-5'],
      timeLimit: 60,
      points: 25
    }
  ];

  const [completedActions, setCompletedActions] = useState<string[]>([]);

  // 视频路径配置
  const getVideoPath = (stepId: string): string => {
    const videoMap: { [key: string]: string } = {
      'identify-choking': '/videos/heimlich/identify-choking.mp4',
      'position-behind': '/videos/heimlich/position-behind.mp4',
      'hand-position': '/videos/heimlich/hand-position.mp4',
      'abdominal-thrust': '/videos/heimlich/abdominal-thrust.mp4'
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
        window.location.href = `/results?type=heimlich&score=${totalScore}&quizScore=${totalQuizScore}&timeExpired=true`;
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

    // 特殊处理腹部冲击
    if (action === 'abdominal-thrust') {
      const newCount = thrustCount + 1;
      setThrustCount(newCount);

      if (newCount >= 5) {
        if (!newCompletedActions.includes('thrust-5')) {
          setCompletedActions([...newCompletedActions, 'thrust-5']);
        }
      }
    }

    // 检查当前步骤是否完成
    checkStepCompletion(newCompletedActions);
  };

  const handleHandDrag = (x: number, y: number) => {
    setHandPosition({x, y});
    
    // 检查手部位置是否正确（简单的区域检测）
    const correctZone = x > 220 && x < 280 && y > 180 && y < 220;
    if (correctZone && !completedActions.includes('position-hands')) {
      handleAction('position-hands');
    }
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
    const stepQuestions = heimlichQuestions.filter(q => q.stepId === currentStepData.id);
    
    if (stepQuestions.length > 0) {
      // 随机选择一个问题
      const randomQuestion = stepQuestions[Math.floor(Math.random() * stepQuestions.length)];
      setCurrentQuiz(randomQuestion);
      setShowQuiz(true);
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
      score = Math.max(score * 0.8, 0); // 超时扣分
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
    setThrustCount(0);
    setHandPosition(null);

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
      score = Math.max(score * 0.8, 0); // 超时扣分
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
    setThrustCount(0);
    setHandPosition(null);

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
    
    console.log('Heimlich training completed:', {
      totalScore,
      totalQuizScore,
      steps: finalResult
    });

    // 跳转到结果页面
    window.location.href = `/results?type=heimlich&score=${totalScore}&quizScore=${totalQuizScore}`;
  };

  const resetSimulation = () => {
    setTrainingPhase('knowledge');
    setCurrentStep(0);
    setStepResults([]);
    setCompletedActions([]);
    setThrustCount(0);
    setHandPosition(null);
    setIsActive(false);
    setShowQuiz(false);
    setCurrentQuiz(null);
    setKnowledgeTestResults({});
    setCurrentStepQuestions([]);
    setCurrentQuestionIndex(0);
    setCanShowInstructions(false);
    setTotalTimeLeft(7 * 60);
    setTrainingStarted(false);
    setTimeExpired(false);
  };

  const startKnowledgeTest = () => {
    if (!trainingStarted) {
      setTrainingStarted(true); // 启动总体计时
    }
    
    const currentStepData = steps[currentStep];
    const stepQuestions = heimlichQuestions.filter(q => q.stepId === currentStepData.id);
    
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
          <h2 className="text-2xl font-bold text-gray-900">Heimlich Maneuver Training</h2>
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
              trainingPhase === 'instruction' ? 'bg-yellow-600' : 'bg-green-600'
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
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <Users className="h-5 w-5 text-blue-600" />
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
              {trainingPhase === 'practice' && heimlichQuestions.some(q => q.stepId === currentStepData.id) && (
                <button
                  onClick={() => {
                    const stepQuestions = heimlichQuestions.filter(q => q.stepId === currentStepData.id);
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
            {currentStepData.id === 'abdominal-thrust' && isActive && (
              <div className="bg-gray-50 p-3 rounded-lg text-center mb-4">
                <div className="text-2xl font-bold text-blue-600">{thrustCount}</div>
                <div className="text-sm text-gray-600">Thrusts (Target: 5)</div>
              </div>
            )}
          </>
        ) : (
          // 初始状态显示
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Heimlich Maneuver Training</h3>
            <p className="text-gray-600 mb-6">
              Learn how to help choking victims through interactive simulation and knowledge testing.
            </p>
            <div className="bg-blue-50 text-blue-800 px-6 py-4 rounded-lg">
              <p className="font-medium mb-2">Training Process:</p>
              <div className="text-sm space-y-1">
                <p>1. 🧠 Knowledge Test - Answer questions correctly to unlock instructions</p>
                <p>2. 📋 Instructions - Review detailed operation steps</p>
                <p>3. 🎯 Practice Session - Hands-on Heimlich maneuver simulation</p>
                <p>4. 📊 Assessment - Get your combined score and feedback</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Area */}
      <div className="bg-gray-100 rounded-xl p-8 min-h-96 relative">
        {trainingPhase === 'practice' && isActive ? (
          <HeimlichInteractiveArea 
            step={currentStepData}
            onAction={handleAction}
            completedActions={completedActions}
            thrustCount={thrustCount}
            handPosition={handPosition}
            onHandDrag={handleHandDrag}
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
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
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

interface HeimlichInteractiveAreaProps {
  step: HeimlichStep;
  onAction: (action: string) => void;
  completedActions: string[];
  thrustCount: number;
  handPosition: {x: number, y: number} | null;
  onHandDrag: (x: number, y: number) => void;
}

const HeimlichInteractiveArea: React.FC<HeimlichInteractiveAreaProps> = ({
  step,
  onAction,
  completedActions,
  thrustCount,
  handPosition,
  onHandDrag
}) => {
  const isActionCompleted = (action: string) => completedActions.includes(action);

  switch (step.id) {
    case 'identify-choking':
      return (
        <div className="text-center">
          <div className="w-64 h-64 bg-red-200 rounded-lg mb-6 mx-auto flex items-center justify-center relative">
            <span className="text-red-800 font-medium">Choking Patient</span>
            {/* 症状指示器 */}
            <div className="absolute top-4 right-4">
              <AlertTriangle className="h-6 w-6 text-red-600 animate-pulse" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => onAction('check-breathing')}
              className={`p-4 rounded-lg font-medium transition-colors ${
                isActionCompleted('check-breathing')
                  ? 'bg-green-500 text-white'
                  : 'bg-yellow-500 text-white hover:bg-yellow-600'
              }`}
            >
              {isActionCompleted('check-breathing') ? '✓ Checked' : 'Check Breathing'}
            </button>
            
            <button
              onClick={() => onAction('identify-signs')}
              className={`p-4 rounded-lg font-medium transition-colors ${
                isActionCompleted('identify-signs')
                  ? 'bg-green-500 text-white'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              {isActionCompleted('identify-signs') ? '✓ Identified' : 'Identify Choking Signs'}
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
            <p>Choking symptoms: Unable to speak, difficulty breathing, blue face, hands on throat</p>
          </div>
        </div>
      );

    case 'position-behind':
      return (
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="w-64 h-64 bg-blue-200 rounded-lg mx-auto flex items-center justify-center relative">
              <span className="text-blue-800 font-medium">患者</span>
              
              {/* 后方站立位置 */}
              <button
                onClick={() => onAction('stand-behind')}
                className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-8 rounded ${
                  isActionCompleted('stand-behind') 
                    ? 'bg-green-500 text-white text-xs' 
                    : 'bg-yellow-400 hover:bg-yellow-500 text-xs'
                } transition-colors`}
              >
                {isActionCompleted('stand-behind') ? '✓' : 'Stand Here'}
              </button>
            </div>
          </div>
          
          <button
            onClick={() => onAction('arms-around')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              isActionCompleted('arms-around')
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isActionCompleted('arms-around') ? '✓ Arms wrapped' : 'Wrap Arms Around Patient'}
          </button>
        </div>
      );

    case 'hand-position':
      return (
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="w-64 h-64 bg-blue-200 rounded-lg mx-auto flex items-center justify-center relative">
              <span className="text-blue-800 font-medium">患者</span>
              
              {/* 正确手部位置区域 */}
              <div className="absolute top-24 left-1/2 transform -translate-x-1/2 w-8 h-8 border-2 border-dashed border-red-400 rounded-full bg-red-100 opacity-50">
              </div>
              
              {/* 可拖拽的手部 */}
              <div
                className="absolute w-8 h-8 bg-orange-400 rounded-full cursor-pointer hover:bg-orange-500 transition-colors flex items-center justify-center text-white text-xs font-bold"
                style={{
                  left: handPosition?.x || 120,
                  top: handPosition?.y || 100
                }}
                onMouseDown={(e) => {
                  const startX = e.clientX;
                  const startY = e.clientY;
                  const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                  
                  const handleMouseMove = (e: MouseEvent) => {
                    const newX = e.clientX - startX + (handPosition?.x || 120);
                    const newY = e.clientY - startY + (handPosition?.y || 100);
                    onHandDrag(
                      Math.max(0, Math.min(newX, rect.width - 32)),
                      Math.max(0, Math.min(newY, rect.height - 32))
                    );
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              >
                拳
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => onAction('make-fist')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isActionCompleted('make-fist')
                  ? 'bg-green-500 text-white'
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              }`}
            >
              {isActionCompleted('make-fist') ? '✓ Fist made' : 'Make a Fist'}
            </button>
            
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              Drag orange circle to correct position (two fingers above navel)
            </div>
          </div>
        </div>
      );

    case 'abdominal-thrust':
      return (
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="w-64 h-64 bg-blue-200 rounded-lg mx-auto flex items-center justify-center relative">
              <span className="text-blue-800 font-medium">患者</span>
              
              {/* 腹部冲击区域 */}
              <button
                onClick={() => onAction('abdominal-thrust')}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-12 rounded bg-red-400 hover:bg-red-500 transition-colors flex items-center justify-center text-white font-bold text-sm"
              >
                Thrust
              </button>
              
              {/* 冲击方向指示 */}
              <div className="absolute top-16 left-1/2 transform -translate-x-1/2 text-xs text-red-600 font-medium">
                ↗ Inward & Upward
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              Target: 5 abdominal thrusts | Current: {thrustCount}/5
              <br />
              Quick forceful thrusts inward and upward
            </p>
          </div>
        </div>
      );

    default:
      return <div>Unknown step</div>;
  }
};

export default HeimlichSimulator;