import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Star, Clock, RotateCcw } from 'lucide-react';

const Results: React.FC = () => {
  const [searchParams] = useSearchParams();
  const trainingType = searchParams.get('type');
  const score = parseInt(searchParams.get('score') || '85');
  const quizScore = parseInt(searchParams.get('quizScore') || '0');
  const timeExpired = searchParams.get('timeExpired') === 'true';
  
  // 获取成绩数据
  const results = {
    score: score,
    quizScore: quizScore,
    totalScore: score + quizScore,
    totalSteps: trainingType === 'cpr' ? 5 : 4,
    completedSteps: trainingType === 'cpr' ? 4 : 4,
    timeSpent: trainingType === 'cpr' ? 420 : 180, // 秒
    accuracy: 88
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreText = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Link to="/" className="flex items-center text-gray-600 hover:text-gray-800">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Home
        </Link>
      </div>

      <div className="bg-white rounded-xl p-8 shadow-sm border">
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            timeExpired ? 'bg-yellow-100' : 'bg-green-100'
          }`}>
            {timeExpired ? (
              <Clock className="h-8 w-8 text-yellow-600" />
            ) : (
              <CheckCircle className="h-8 w-8 text-green-600" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {timeExpired ? 'Time Expired!' : 'Training Complete!'}
          </h1>
          <p className="text-lg text-gray-600">
            {trainingType === 'cpr' ? 'CPR (Cardiopulmonary Resuscitation)' : 'Heimlich Maneuver'} Training Results
          </p>
          {timeExpired && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-medium">
                ⏰ Training was incomplete due to time limit ({trainingType === 'cpr' ? '5 minutes' : '7 minutes'})
              </p>
              <p className="text-yellow-700 text-sm mt-1">
                You can retrain to complete all steps and improve your score.
              </p>
            </div>
          )}
        </div>

        {/* Score Overview */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className={`text-3xl font-bold mb-2 ${getScoreColor(results.totalScore)}`}>
              {results.totalScore}
            </div>
            <div className="text-sm text-gray-600">Total Score</div>
            <div className={`text-sm font-medium ${getScoreColor(results.totalScore)}`}>
              {getScoreText(results.totalScore)}
            </div>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {results.score}
            </div>
            <div className="text-sm text-gray-600">Training Score</div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {results.quizScore}
            </div>
            <div className="text-sm text-gray-600">Knowledge Score</div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {results.completedSteps}/{results.totalSteps}
            </div>
            <div className="text-sm text-gray-600">Completed Steps</div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {formatTime(results.timeSpent)}
            </div>
            <div className="text-sm text-gray-600">Time Spent</div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {results.accuracy}%
            </div>
            <div className="text-sm text-gray-600">Accuracy</div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Step Details</h3>
          <div className="space-y-3">
            {trainingType === 'cpr' ? (
              <>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-900">Check Consciousness</span>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-medium">Completed</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-900">Call for Help</span>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-medium">Completed</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-900">Position Patient</span>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-medium">Completed</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="text-gray-900">Chest Compressions</span>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-yellow-600 font-medium">Needs Improvement</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-900">Rescue Breathing</span>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-medium">Completed</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-900">Identify Choking</span>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-medium">Completed</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-900">Position Behind</span>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-medium">Completed</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-900">Hand Position</span>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-medium">Completed</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-900">Abdominal Thrusts</span>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-medium">Completed</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Performance Summary */}
        {results.quizScore > 0 && (
          <div className="bg-green-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">Knowledge Assessment</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-800">
                  Great job on the knowledge questions! You earned <strong>{results.quizScore} bonus points</strong> for demonstrating theoretical understanding.
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Combining practical skills with theoretical knowledge is key to effective emergency response.
                </p>
              </div>
              <div className="text-4xl">🧠</div>
            </div>
          </div>
        )}

        {/* Feedback */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Learning Suggestions</h3>
          <ul className="space-y-2 text-blue-800">
            {timeExpired && (
              <li className="font-medium text-yellow-800 bg-yellow-100 p-2 rounded">
                • ⏱️ Focus on improving speed and efficiency - emergency situations require quick response
              </li>
            )}
            {trainingType === 'cpr' ? (
              <>
                <li>• Ensure compression depth reaches 5-6 centimeters during chest compressions</li>
                <li>• Maintain compression rate between 100-120 per minute</li>
                <li>• Allow complete chest recoil after each compression</li>
                <li>• Practice compression rhythm with a metronome</li>
                <li>• Continue studying emergency response theory to boost your knowledge scores</li>
                {timeExpired && (
                  <li>• Practice under time pressure to build muscle memory and confidence</li>
                )}
              </>
            ) : (
              <>
                <li>• Ensure accurate hand position, two fingers above the navel</li>
                <li>• Thrust direction should be inward and upward, not just upward</li>
                <li>• Each thrust should be quick and forceful</li>
                <li>• Continuously observe patient response, stop immediately when object is expelled</li>
                <li>• Review choking recognition signs and emergency protocols</li>
                {timeExpired && (
                  <li>• Practice rapid decision-making for choking emergency scenarios</li>
                )}
              </>
            )}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to={trainingType === 'cpr' ? '/cpr' : '/heimlich'}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Retrain
          </Link>
          
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </Link>
          
          <Link
            to={trainingType === 'cpr' ? '/heimlich' : '/cpr'}
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Other Training
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Results;