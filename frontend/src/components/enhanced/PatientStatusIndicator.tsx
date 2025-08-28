import React, { useEffect, useState } from 'react';
import { Heart, Zap, AlertCircle } from 'lucide-react';

interface PatientStatusIndicatorProps {
  consciousness: 'conscious' | 'unconscious' | 'responding';
  heartRate: number; // 0 = 无心跳, 1-180 = 心率
  breathing: 'normal' | 'weak' | 'none';
  pulse: 'strong' | 'weak' | 'none';
  className?: string;
}

const PatientStatusIndicator: React.FC<PatientStatusIndicatorProps> = ({
  consciousness,
  heartRate,
  breathing,
  pulse,
  className = ''
}) => {
  const [heartBeat, setHeartBeat] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState(false);

  // 心跳动画
  useEffect(() => {
    if (heartRate === 0) return;
    
    const interval = heartRate > 0 ? 60000 / heartRate : 1000;
    const timer = setInterval(() => {
      setHeartBeat(true);
      setTimeout(() => setHeartBeat(false), 200);
    }, interval);

    return () => clearInterval(timer);
  }, [heartRate]);

  // 呼吸动画
  useEffect(() => {
    if (breathing === 'none') return;
    
    const breathingRate = breathing === 'normal' ? 4000 : 6000; // 正常15次/分钟，虚弱10次/分钟
    const timer = setInterval(() => {
      setBreathingPhase(true);
      setTimeout(() => setBreathingPhase(false), breathingRate / 2);
    }, breathingRate);

    return () => clearInterval(timer);
  }, [breathing]);

  const getHeartColor = () => {
    if (heartRate === 0) return 'text-gray-400';
    if (heartRate < 60 || heartRate > 100) return 'text-red-500';
    return 'text-green-500';
  };

  const getPulseColor = () => {
    switch (pulse) {
      case 'strong': return 'bg-green-500';
      case 'weak': return 'bg-yellow-500';
      case 'none': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getConsciousnessColor = () => {
    switch (consciousness) {
      case 'conscious': return 'text-green-600';
      case 'responding': return 'text-yellow-600';
      case 'unconscious': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getBreathingIntensity = () => {
    switch (breathing) {
      case 'normal': return breathingPhase ? 'scale-110' : 'scale-100';
      case 'weak': return breathingPhase ? 'scale-105' : 'scale-100';
      case 'none': return 'scale-100';
      default: return 'scale-100';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-4 border-2 border-gray-200 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Zap className="h-5 w-5 mr-2 text-blue-600" />
        Patient Vital Signs
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* 心率指示器 */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Heart 
              className={`h-8 w-8 transition-all duration-200 ${getHeartColor()} ${
                heartBeat && heartRate > 0 ? 'scale-125 drop-shadow-lg' : 'scale-100'
              }`}
              fill={heartRate > 0 ? 'currentColor' : 'none'}
            />
            {heartRate > 0 && (
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                heartBeat ? 'bg-red-400 animate-ping' : 'bg-red-600'
              }`} />
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">Heart Rate</div>
            <div className={`text-lg font-bold ${getHeartColor()}`}>
              {heartRate === 0 ? 'No Signal' : `${heartRate} BPM`}
            </div>
          </div>
        </div>

        {/* 脉搏指示器 */}
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-6 rounded-full transition-all duration-300 ${getPulseColor()} ${
                  pulse !== 'none' && heartBeat ? 'opacity-100' : 'opacity-60'
                }`}
                style={{
                  animationDelay: `${i * 100}ms`,
                  transform: pulse !== 'none' && heartBeat ? `scaleY(${1.5 - i * 0.2})` : 'scaleY(1)'
                }}
              />
            ))}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">Pulse</div>
            <div className={`text-sm font-semibold capitalize ${
              pulse === 'none' ? 'text-red-600' : 
              pulse === 'weak' ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {pulse}
            </div>
          </div>
        </div>

        {/* 呼吸指示器 */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div 
              className={`w-8 h-8 rounded-full border-2 transition-transform duration-1000 ${
                breathing === 'none' ? 'border-gray-400 bg-gray-200' :
                breathing === 'weak' ? 'border-yellow-400 bg-yellow-100' :
                'border-blue-400 bg-blue-100'
              } ${getBreathingIntensity()}`}
            >
              <div className={`absolute inset-1 rounded-full transition-all duration-1000 ${
                breathing === 'none' ? 'bg-gray-300' :
                breathing === 'weak' ? 'bg-yellow-300' :
                'bg-blue-300'
              } ${breathingPhase ? 'scale-110 opacity-70' : 'scale-90 opacity-40'}`} />
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">Breathing</div>
            <div className={`text-sm font-semibold capitalize ${
              breathing === 'none' ? 'text-red-600' : 
              breathing === 'weak' ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {breathing}
            </div>
          </div>
        </div>

        {/* 意识状态指示器 */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              consciousness === 'conscious' ? 'bg-green-100' :
              consciousness === 'responding' ? 'bg-yellow-100' :
              'bg-red-100'
            }`}>
              {consciousness === 'unconscious' ? (
                <AlertCircle className="h-5 w-5 text-red-600" />
              ) : (
                <div className={`w-3 h-3 rounded-full ${
                  consciousness === 'conscious' ? 'bg-green-500' : 'bg-yellow-500'
                }`}>
                  {consciousness === 'responding' && (
                    <div className="w-full h-full bg-yellow-400 rounded-full animate-pulse" />
                  )}
                </div>
              )}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">Consciousness</div>
            <div className={`text-sm font-semibold capitalize ${getConsciousnessColor()}`}>
              {consciousness}
            </div>
          </div>
        </div>
      </div>

      {/* 整体状态指示 */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Overall Status:</span>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            heartRate === 0 || consciousness === 'unconscious' || breathing === 'none'
              ? 'bg-red-100 text-red-800'
              : pulse === 'weak' || breathing === 'weak' || consciousness === 'responding'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }`}>
            {heartRate === 0 || consciousness === 'unconscious' || breathing === 'none'
              ? 'Critical'
              : pulse === 'weak' || breathing === 'weak' || consciousness === 'responding'
              ? 'Unstable'
              : 'Stable'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientStatusIndicator;