import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, RotateCcw, Zap, Star } from 'lucide-react';
import CPRSimulator from '../components/CPRTraining/CPRSimulator';

const CPRTraining: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTraining, setIsTraining] = useState(false);

  const steps = [
    {
      id: 'check-consciousness',
      name: 'Check Consciousness',
      description: 'Gently tap the patient\'s shoulders and shout loudly "Are you okay?"',
      instruction: 'Click on the patient\'s shoulder to check'
    },
    {
      id: 'call-help',
      name: 'Call for Help',
      description: 'Shout for help and call 911 for emergency services',
      instruction: 'Click the call for help button'
    },
    {
      id: 'position',
      name: 'Position Patient',
      description: 'Place patient supine on hard surface, tilt head back, open airway',
      instruction: 'Drag to adjust patient position'
    },
    {
      id: 'compression',
      name: 'Chest Compressions',
      description: 'Place hands overlapped, heel of palm on lower half of breastbone, press straight down',
      instruction: 'Perform 30 compressions, depth 2-2.4 inches, rate 100-120/minute'
    },
    {
      id: 'ventilation',
      name: 'Rescue Breathing',
      description: 'Open airway, provide mouth-to-mouth artificial respiration',
      instruction: 'Give 2 effective breaths'
    }
  ];

  const startTraining = () => {
    setIsTraining(true);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Training completed, navigate to results page
      window.location.href = '/results?type=cpr';
    }
  };

  const resetTraining = () => {
    setIsTraining(false);
    setCurrentStep(0);
  };

  if (!isTraining) {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              CPR (Cardiopulmonary Resuscitation) Training
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Learn standard CPR procedures and master life-saving skills
            </p>
            
            {/* Enhanced Training Option */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold text-gray-800">NEW: Enhanced Training Experience</span>
                <div className="flex space-x-1">
                  {Array.from({ length: 3 }, (_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Experience next-generation training with real-time patient monitoring, smart guidance, 
                gamification, and immersive audio feedback!
              </p>
              <Link
                to="/cpr/enhanced"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all text-sm font-medium"
              >
                <Zap className="h-4 w-4 mr-2" />
                Try Enhanced Mode
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Training Content</h3>
              <ul className="space-y-3">
                {steps.map((step, index) => (
                  <li key={step.id} className="group flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{step.name}</div>
                      <div className="text-sm text-gray-600">{step.description}</div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center space-x-2 text-xs text-blue-600">
                        <Play className="h-3 w-3" />
                        <span>Video Guide</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center text-blue-800 text-sm">
                  <Zap className="h-4 w-4 mr-2" />
                  <span className="font-medium">Pro Tip:</span>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  Try the Enhanced Mode for interactive video guides, real-time feedback, and gamified learning!
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Key Points</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Compression depth: 2-2.4 inches</li>
                <li>• Compression rate: 100-120 per minute</li>
                <li>• Compression to ventilation ratio: 30:2</li>
                <li>• Ensure complete recoil</li>
                <li>• Minimize interruptions</li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={startTraining}
              className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              <Play className="h-5 w-5 mr-2" />
              Start Training
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link to="/" className="flex items-center text-gray-600 hover:text-gray-800">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Home
        </Link>
      </div>
      <CPRSimulator />
    </div>
  );
};

export default CPRTraining;