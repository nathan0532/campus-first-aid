import React, { useState } from 'react';
import { ArrowLeft, Zap, Heart, Star, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import EnhancedCPRSimulator from '../components/enhanced/EnhancedCPRSimulator';

const EnhancedCPRTraining: React.FC = () => {
  const [showFeatures, setShowFeatures] = useState(true);

  if (!showFeatures) {
    return <EnhancedCPRSimulator />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/cpr"
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Standard Training
          </Link>
          
          <div className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            <span className="text-lg font-semibold text-gray-800">Enhanced Mode</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <Heart className="h-10 w-10 text-red-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Enhanced CPR Training Experience
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Experience next-generation emergency training with real-time feedback, 
            gamification, and immersive interactions designed to maximize learning effectiveness.
          </p>

          <div className="flex items-center justify-center space-x-2 mb-8">
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
            ))}
            <span className="ml-2 text-gray-600 font-medium">Revolutionary Training System</span>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Patient Status</h3>
            <p className="text-gray-600 text-sm">
              Monitor patient vital signs with dynamic heart rate, breathing, and pulse indicators that respond to your actions.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-200 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Guidance System</h3>
            <p className="text-gray-600 text-sm">
              Get intelligent, context-aware guidance with real-time quality assessment and improvement suggestions.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Gamified Learning</h3>
            <p className="text-gray-600 text-sm">
              Earn achievements, build combos, and track your progress with an engaging scoring system.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-orange-200 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Settings className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Audio Feedback</h3>
            <p className="text-gray-600 text-sm">
              Experience immersive audio cues including heartbeat sounds, compression feedback, and success notifications.
            </p>
          </div>
        </div>

        {/* Feature Details */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            What Makes This Training Special?
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Interactive Patient Simulation</h3>
                  <p className="text-gray-600 text-sm">
                    Our advanced patient simulation responds realistically to your actions. 
                    Watch vital signs improve as you perform correct CPR techniques.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Instant Quality Assessment</h3>
                  <p className="text-gray-600 text-sm">
                    Receive immediate feedback on compression depth, rate, and hand placement. 
                    Learn from mistakes in real-time.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Achievement System</h3>
                  <p className="text-gray-600 text-sm">
                    Unlock achievements for perfect techniques, speed records, and consistency. 
                    Stay motivated with progress tracking.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Immersive Audio Experience</h3>
                  <p className="text-gray-600 text-sm">
                    Hear realistic heartbeat sounds, compression audio feedback, and celebratory 
                    sounds that enhance the training experience.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">5</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Adaptive Learning Path</h3>
                  <p className="text-gray-600 text-sm">
                    The system adapts to your skill level, providing more guidance where needed 
                    and challenging you to improve consistently.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">6</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Professional Analytics</h3>
                  <p className="text-gray-600 text-sm">
                    Get detailed performance analytics including accuracy metrics, 
                    timing analysis, and improvement recommendations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Experience the Future of CPR Training?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of students who have revolutionized their emergency response skills.
            </p>
            
            <button
              onClick={() => setShowFeatures(false)}
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              <Zap className="h-6 w-6 mr-3" />
              Start Enhanced Training
            </button>
            
            <div className="mt-6 text-sm opacity-80">
              <p>✨ No additional setup required • 🎧 Works best with audio enabled • 🏆 Track your progress</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCPRTraining;