import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizModalProps {
  isOpen: boolean;
  question: QuizQuestion;
  onClose: () => void;
  onAnswer: (correct: boolean) => void;
  timeLimit?: number; // 倒计时时间，默认5秒
}

const QuizModal: React.FC<QuizModalProps> = ({ isOpen, question, onClose, onAnswer, timeLimit = 5 }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [timerActive, setTimerActive] = useState(true);

  // 倒计时效果
  useEffect(() => {
    if (!isOpen || !timerActive || answered) return;

    if (timeLeft <= 0) {
      // 时间到，自动提交（视为错误）
      setSelectedAnswer(-1); // 使用-1表示超时
      setAnswered(true);
      setShowResult(true);
      setTimeout(() => {
        onAnswer(false);
      }, 2000);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isOpen, timerActive, answered, onAnswer]);

  // 重置状态
  useEffect(() => {
    if (isOpen) {
      setSelectedAnswer(null);
      setShowResult(false);
      setAnswered(false);
      setTimeLeft(timeLimit);
      setTimerActive(true);
    }
  }, [isOpen, timeLimit, question.id]);

  if (!isOpen) return null;

  const handleAnswerSelect = (answerIndex: number) => {
    if (answered) return;
    
    setSelectedAnswer(answerIndex);
    setAnswered(true);
    setShowResult(true);
    setTimerActive(false); // 停止倒计时
    
    const isCorrect = answerIndex === question.correctAnswer;
    setTimeout(() => {
      onAnswer(isCorrect);
    }, 2000);
  };

  const handleClose = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setAnswered(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Knowledge Check</h3>
            <div className="flex items-center space-x-4">
              {/* 倒计时显示 */}
              {!answered && timerActive && (
                <div className={`flex items-center px-3 py-1 rounded-full ${
                  timeLeft <= 2 ? 'bg-red-100 text-red-700' : 
                  timeLeft <= 3 ? 'bg-yellow-100 text-yellow-700' : 
                  'bg-blue-100 text-blue-700'
                }`}>
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="font-medium text-sm">{timeLeft}s</span>
                </div>
              )}
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-lg text-gray-800 mb-6 leading-relaxed">
              {question.question}
            </p>

            <div className="space-y-3">
              {question.options.map((option, index) => {
                let buttonClass = "w-full p-4 text-left border-2 rounded-lg transition-all duration-200 ";
                
                if (!answered) {
                  buttonClass += "border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer";
                } else {
                  if (index === question.correctAnswer) {
                    buttonClass += "border-green-500 bg-green-50 text-green-800";
                  } else if (index === selectedAnswer && index !== question.correctAnswer) {
                    buttonClass += "border-red-500 bg-red-50 text-red-800";
                  } else {
                    buttonClass += "border-gray-200 bg-gray-50 text-gray-600";
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={answered}
                    className={buttonClass}
                  >
                    <div className="flex items-center">
                      <span className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center mr-3 text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1">{option}</span>
                      {answered && index === question.correctAnswer && (
                        <CheckCircle className="h-5 w-5 text-green-600 ml-2" />
                      )}
                      {answered && index === selectedAnswer && index !== question.correctAnswer && (
                        <AlertCircle className="h-5 w-5 text-red-600 ml-2" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {showResult && (
            <div className={`p-4 rounded-lg mb-4 ${
              selectedAnswer === question.correctAnswer 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start">
                {selectedAnswer === question.correctAnswer ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                )}
                <div>
                  <p className={`font-medium mb-2 ${
                    selectedAnswer === question.correctAnswer ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {selectedAnswer === question.correctAnswer ? 'Correct!' : 
                     selectedAnswer === -1 ? 'Time Up!' : 'Incorrect'}
                  </p>
                  <p className={`text-sm ${
                    selectedAnswer === question.correctAnswer ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {selectedAnswer === -1 ? 
                      `Time's up! The correct answer was: ${question.options[question.correctAnswer]}. ${question.explanation}` :
                      question.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!answered && (
            <div className="text-center">
              <p className="text-sm text-gray-500">
                {timeLeft > 0 ? 'Select your answer to continue' : 'Time up! Moving to next question...'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;