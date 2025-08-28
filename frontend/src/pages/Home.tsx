import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, Clock, Trophy, Lock } from 'lucide-react';
import Banner from '../components/common/Banner';
import SimpleLeaderboard from '../components/SimpleLeaderboard';
import { isAuthenticated } from '../utils/auth';

const Home: React.FC = () => {
  const authenticated = isAuthenticated();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Banner Section */}
      <Banner
        title="Master Emergency Skills Save Precious Lives"
        subtitle="CERT Emergency Response Training for Youth"
        description="Learn essential CPR and Heimlich maneuver techniques through interactive simulation training. Real-time feedback and scientific progress assessment make emergency skills accessible to everyone."
        primaryButtonText={authenticated ? "Start Training" : "Login to Start"}
        primaryButtonLink={authenticated ? "/cpr" : "/login"}
        secondaryButtonText="Learn More"
        secondaryButtonLink="/about"
        backgroundImage="/new-banner.jpg"
      />

      {/* Welcome Notice for logged in users */}
      {authenticated && (
        <div className="bg-green-50 border-l-4 border-green-400 p-6 mb-8 rounded-r-lg">
          <div className="flex items-center">
            <Trophy className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-green-900 mb-2">
                欢迎开始急救技能训练！
              </h3>
              <p className="text-green-800 mb-4">
                选择CPR或海姆立克急救法开始你的训练。系统将记录你的进度并提供详细的技能评估。
              </p>
              <div className="space-x-4">
                <Link
                  to="/guide"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  查看训练指南
                </Link>
                <Link
                  to="/profile"
                  className="inline-flex items-center px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                >
                  查看个人进度
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Required Notice */}
      {!authenticated && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8 rounded-r-lg">
          <div className="flex items-center">
            <Lock className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Login to Start Training
              </h3>
              <p className="text-blue-800 mb-4">
                Please log in or register an account to access the complete emergency response training simulation system, including interactive learning for CPR and Heimlich maneuver techniques.
              </p>
              <div className="space-x-4">
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign In Now
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto">

      {/* Training Scenarios */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* CPR Training Card */}
        {authenticated ? (
          <Link
            to="/cpr"
            className="group block p-6 bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <Heart className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                  CPR (Cardiopulmonary Resuscitation)
                </h3>
                <p className="text-gray-600">Cardiac arrest emergency training</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              Learn the standard CPR procedure, including chest compressions and rescue breathing.
              Master correct compression depth, rate, and ventilation techniques through real-time feedback.
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Estimated time: 5-8 minutes</span>
              <span className="text-red-600 font-medium">Start Training →</span>
            </div>
          </Link>
        ) : (
          <div className="group block p-6 bg-gray-50 rounded-xl shadow-sm border cursor-not-allowed relative">
            <div className="absolute top-4 right-4">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <Heart className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-500">
                  CPR (Cardiopulmonary Resuscitation)
                </h3>
                <p className="text-gray-400">Cardiac arrest emergency training</p>
              </div>
            </div>
            <p className="text-gray-500 mb-4">
              Learn the standard CPR procedure, including chest compressions and rescue breathing.
              Master correct compression depth, rate, and ventilation techniques through real-time feedback.
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Estimated time: 5-8 minutes</span>
              <span className="text-gray-400 font-medium">Login Required</span>
            </div>
          </div>
        )}

        {/* Heimlich Training Card */}
        {authenticated ? (
          <Link
            to="/heimlich"
            className="group block p-6 bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Heimlich Maneuver
                </h3>
                <p className="text-gray-600">Choking emergency training</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              Master the correct Heimlich maneuver technique, learn to identify choking symptoms,
              proper positioning, and abdominal thrust techniques to save lives in critical moments.
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Estimated time: 3-5 minutes</span>
              <span className="text-blue-600 font-medium">Start Training →</span>
            </div>
          </Link>
        ) : (
          <div className="group block p-6 bg-gray-50 rounded-xl shadow-sm border cursor-not-allowed relative">
            <div className="absolute top-4 right-4">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-500">
                  Heimlich Maneuver
                </h3>
                <p className="text-gray-400">Choking emergency training</p>
              </div>
            </div>
            <p className="text-gray-500 mb-4">
              Master the correct Heimlich maneuver technique, learn to identify choking symptoms,
              proper positioning, and abdominal thrust techniques to save lives in critical moments.
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Estimated time: 3-5 minutes</span>
              <span className="text-gray-400 font-medium">Login Required</span>
            </div>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="bg-white rounded-xl p-8 shadow-sm border mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Training Features
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="p-3 bg-green-100 rounded-lg w-fit mx-auto mb-3">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Real-time Feedback</h3>
            <p className="text-gray-600 text-sm">
              Instant feedback for every operation step to help you correct mistakes promptly
            </p>
          </div>
          
          <div className="text-center">
            <div className="p-3 bg-purple-100 rounded-lg w-fit mx-auto mb-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Interactive Learning</h3>
            <p className="text-gray-600 text-sm">
              Enhanced learning experience and memory retention through clicking and dragging interactions
            </p>
          </div>
          
          <div className="text-center">
            <div className="p-3 bg-orange-100 rounded-lg w-fit mx-auto mb-3">
              <Trophy className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Skill Assessment</h3>
            <p className="text-gray-600 text-sm">
              Comprehensive scoring system to track learning progress and quantify skill mastery
            </p>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <SimpleLeaderboard />
      </div>
    </div>
  );
};

export default Home;