import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { Volume2, VolumeX, Settings } from 'lucide-react';
import { useMultiAudio, SoundEffect } from '../../hooks/useAudio';

interface AudioContextType {
  playSound: (effect: SoundEffect, volume?: number) => boolean;
  playLoopingSound: (effect: SoundEffect, volume?: number) => HTMLAudioElement | null;
  stopAllSounds: () => void;
  globalVolume: number;
  setGlobalVolume: (volume: number) => void;
  muted: boolean;
  toggleMute: () => void;
  isAudioEnabled: boolean;
  enableAudio: () => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within AudioProvider');
  }
  return context;
};

interface AudioProviderProps {
  children: React.ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const audioHook = useMultiAudio();
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // 用户首次交互后启用音频
  const enableAudio = useCallback(() => {
    setIsAudioEnabled(true);
  }, []);

  // 监听用户首次点击来启用音频
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!isAudioEnabled) {
        enableAudio();
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
      }
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [isAudioEnabled, enableAudio]);

  const contextValue: AudioContextType = {
    ...audioHook,
    isAudioEnabled,
    enableAudio,
    playSound: (effect: SoundEffect, volume?: number) => {
      if (!isAudioEnabled) return false;
      return audioHook.playSound(effect, { volume });
    },
    playLoopingSound: (effect: SoundEffect, volume?: number) => {
      if (!isAudioEnabled) return null;
      return audioHook.playLoopingSound(effect, volume);
    }
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
      
      {/* 音频控制面板 */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex items-center space-x-2">
          {/* 音量控制按钮 */}
          <button
            onClick={audioHook.toggleMute}
            className={`p-3 rounded-full shadow-lg transition-all ${
              audioHook.muted 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            title={audioHook.muted ? 'Unmute' : 'Mute'}
          >
            {audioHook.muted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>

          {/* 设置按钮 */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 bg-white text-gray-700 rounded-full shadow-lg hover:bg-gray-50 transition-all"
            title="Audio Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* 设置面板 */}
        {showSettings && (
          <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border p-4 w-64">
            <h3 className="font-semibold text-gray-800 mb-3">Audio Settings</h3>
            
            {/* 音频状态 */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Audio Status:</span>
                <span className={`text-sm font-medium ${
                  isAudioEnabled ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {isAudioEnabled ? 'Enabled' : 'Click to Enable'}
                </span>
              </div>
              
              {!isAudioEnabled && (
                <button
                  onClick={enableAudio}
                  className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                >
                  Enable Audio
                </button>
              )}
            </div>

            {/* 音量滑块 */}
            <div className="mb-3">
              <label className="block text-sm text-gray-600 mb-2">
                Master Volume: {Math.round(audioHook.globalVolume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={audioHook.globalVolume}
                onChange={(e) => audioHook.setGlobalVolume(Number(e.target.value))}
                className="w-full"
                disabled={audioHook.muted}
              />
            </div>

            {/* 音效测试 */}
            <div className="space-y-2">
              <span className="text-sm text-gray-600">Test Sounds:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => contextValue.playSound('success')}
                  className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition-colors"
                  disabled={!isAudioEnabled}
                >
                  Success
                </button>
                <button
                  onClick={() => contextValue.playSound('error')}
                  className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors"
                  disabled={!isAudioEnabled}
                >
                  Error
                </button>
                <button
                  onClick={() => contextValue.playSound('heartbeat')}
                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                  disabled={!isAudioEnabled}
                >
                  Heartbeat
                </button>
                <button
                  onClick={() => contextValue.playSound('perfect')}
                  className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200 transition-colors"
                  disabled={!isAudioEnabled}
                >
                  Perfect
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 音频禁用提示 */}
      {!isAudioEnabled && (
        <div className="fixed top-4 right-4 bg-orange-100 border border-orange-300 rounded-lg p-3 shadow-lg z-40">
          <div className="flex items-center space-x-2">
            <VolumeX className="h-5 w-5 text-orange-600" />
            <span className="text-sm text-orange-800">
              Click anywhere to enable audio
            </span>
          </div>
        </div>
      )}
    </AudioContext.Provider>
  );
};

// 音效播放函数，可以在任何地方调用
export const playAudioFeedback = {
  success: () => {
    const audio = new Audio('/sounds/success.mp3');
    audio.volume = 0.7;
    audio.play().catch(() => {});
  },
  error: () => {
    const audio = new Audio('/sounds/error.mp3');
    audio.volume = 0.7;
    audio.play().catch(() => {});
  },
  perfect: () => {
    const audio = new Audio('/sounds/perfect.mp3');
    audio.volume = 0.8;
    audio.play().catch(() => {});
  },
  combo: () => {
    const audio = new Audio('/sounds/combo.mp3');
    audio.volume = 0.8;
    audio.play().catch(() => {});
  },
  heartbeat: () => {
    const audio = new Audio('/sounds/heartbeat.mp3');
    audio.volume = 0.6;
    audio.play().catch(() => {});
  },
  compression: () => {
    const audio = new Audio('/sounds/compression.mp3');
    audio.volume = 0.7;
    audio.play().catch(() => {});
  }
};

export default AudioProvider;