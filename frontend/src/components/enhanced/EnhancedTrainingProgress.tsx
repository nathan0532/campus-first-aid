import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react';
import VideoPlayer from '../common/VideoPlayer';

interface CPRStep {
  id: string;
  name: string;
  description: string;
  instruction: string;
  requiredActions: string[];
  timeLimit?: number;
  points: number;
}

interface EnhancedStep extends CPRStep {
  videoUrl: string;
  thumbnail?: string;
  videoDuration?: number;
  watchProgress?: number;
}

interface ProgressState {
  expandedStep: string | null;
  videoWatched: Set<string>;
  autoPlay: boolean;
  playingVideo: string | null;
}

interface EnhancedTrainingProgressProps {
  steps: CPRStep[];
  currentStep: number;
  completedSteps: string[];
  videoMapping: Record<string, string>;
  className?: string;
}

const EnhancedTrainingProgress: React.FC<EnhancedTrainingProgressProps> = ({
  steps,
  currentStep,
  completedSteps,
  videoMapping,
  className = ''
}) => {
  const [progressState, setProgressState] = useState<ProgressState>({
    expandedStep: null,
    videoWatched: new Set(),
    autoPlay: false,
    playingVideo: null
  });

  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  // 生成增强步骤数据
  const enhancedSteps: EnhancedStep[] = steps.map(step => ({
    ...step,
    videoUrl: videoMapping[step.id] || '',
    thumbnail: `${videoMapping[step.id]?.replace('.mp4', '_thumb.jpg')}` || '',
    videoDuration: 0,
    watchProgress: 0
  }));

  // 切换步骤展开状态
  const toggleStepExpansion = (stepId: string) => {
    setProgressState(prev => ({
      ...prev,
      expandedStep: prev.expandedStep === stepId ? null : stepId,
      playingVideo: prev.expandedStep === stepId ? null : prev.playingVideo
    }));
  };

  // 处理视频播放
  const handleVideoPlay = (stepId: string) => {
    // 暂停其他正在播放的视频
    Object.entries(videoRefs.current).forEach(([id, video]) => {
      if (id !== stepId && video && !video.paused) {
        video.pause();
      }
    });

    setProgressState(prev => ({
      ...prev,
      playingVideo: stepId
    }));
  };

  // 处理视频暂停
  const handleVideoPause = (stepId: string) => {
    setProgressState(prev => ({
      ...prev,
      playingVideo: prev.playingVideo === stepId ? null : prev.playingVideo
    }));
  };

  // 处理视频播放完成
  const handleVideoEnded = (stepId: string) => {
    setProgressState(prev => ({
      ...prev,
      videoWatched: new Set([...prev.videoWatched, stepId]),
      playingVideo: null
    }));
  };

  // 获取步骤状态
  const getStepStatus = (step: EnhancedStep, index: number) => {
    if (completedSteps.includes(step.id)) {
      return 'completed';
    } else if (index === currentStep) {
      return 'current';
    } else if (index < currentStep) {
      return 'available';
    } else {
      return 'locked';
    }
  };

  // 获取步骤状态样式
  const getStepStatusStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'current':
        return 'bg-blue-500 text-white';
      case 'available':
        return 'bg-gray-300 text-gray-600';
      case 'locked':
        return 'bg-gray-200 text-gray-400';
      default:
        return 'bg-gray-200 text-gray-600';
    }
  };

  // 检查是否有视频
  const hasVideo = (step: EnhancedStep) => {
    return step.videoUrl && step.videoUrl !== '';
  };

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
        Training Progress
        <span className="ml-2 text-sm text-gray-500">
          ({completedSteps.length}/{steps.length})
        </span>
      </h3>
      
      <div className="space-y-3">
        {enhancedSteps.map((step, index) => {
          const status = getStepStatus(step, index);
          const isExpanded = progressState.expandedStep === step.id;
          const isWatched = progressState.videoWatched.has(step.id);
          const isPlaying = progressState.playingVideo === step.id;
          
          return (
            <div
              key={step.id}
              className={`border rounded-lg transition-all duration-300 ${
                isExpanded ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* 步骤头部 */}
              <div
                className={`flex items-center p-3 cursor-pointer ${
                  hasVideo(step) ? 'hover:bg-gray-50' : ''
                }`}
                onClick={() => hasVideo(step) && toggleStepExpansion(step.id)}
              >
                {/* 状态指示器 */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                  getStepStatusStyles(status)
                }`}>
                  {status === 'completed' ? '✓' : index + 1}
                </div>

                {/* 步骤信息 */}
                <div className="flex-1 ml-3">
                  <div className={`text-sm font-medium ${
                    status === 'locked' ? 'text-gray-400' : 'text-gray-900'
                  }`}>
                    {step.name}
                  </div>
                  {status === 'current' && (
                    <div className="text-xs text-blue-600 mt-1">Current Step</div>
                  )}
                </div>

                {/* 视频相关指示器 */}
                {hasVideo(step) && (
                  <div className="flex items-center space-x-2">
                    {/* 观看状态 */}
                    {isWatched && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-xs ml-1">Watched</span>
                      </div>
                    )}
                    
                    {/* 缩略图 */}
                    <div className="relative w-12 h-8 bg-gray-200 rounded overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                        <Play className="h-3 w-3 text-white" />
                      </div>
                      {/* 这里可以添加真实的缩略图 */}
                    </div>
                    
                    {/* 展开指示器 */}
                    <div className="text-gray-400">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 展开的视频区域 */}
              {isExpanded && hasVideo(step) && (
                <div className="px-3 pb-3 animate-fadeIn">
                  <div className="border-t border-gray-200 pt-3">
                    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                      <MiniVideoPlayer
                        src={step.videoUrl}
                        title={step.name}
                        stepId={step.id}
                        onPlay={() => handleVideoPlay(step.id)}
                        onPause={() => handleVideoPause(step.id)}
                        onEnded={() => handleVideoEnded(step.id)}
                        isPlaying={isPlaying}
                        ref={(el) => {
                          if (el) {
                            videoRefs.current[step.id] = el.videoElement;
                          }
                        }}
                      />
                      
                      {/* 视频信息 */}
                      <div className="p-3 bg-gray-50">
                        <p className="text-xs text-gray-600 mb-1">
                          {step.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Instructional Video</span>
                          {step.videoDuration && (
                            <span>{Math.round(step.videoDuration)}s</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 总体进度条 */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Overall Progress</span>
          <span>{Math.round((completedSteps.length / steps.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
            style={{
              width: `${(completedSteps.length / steps.length) * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  );
};

// 迷你视频播放器组件
interface MiniVideoPlayerProps {
  src: string;
  title: string;
  stepId: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  isPlaying?: boolean;
  className?: string;
}

const MiniVideoPlayer = React.forwardRef<
  { videoElement: HTMLVideoElement | null },
  MiniVideoPlayerProps
>(({
  src,
  title,
  stepId,
  onPlay,
  onPause,
  onEnded,
  isPlaying = false,
  className = ''
}, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [hasError, setHasError] = useState(false);

  // 暴露video元素给父组件
  React.useImperativeHandle(ref, () => ({
    videoElement: videoRef.current
  }));

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      onPause?.();
    } else {
      videoRef.current.play();
      onPlay?.();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const newTime = Number(e.target.value);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const newVolume = Number(e.target.value);
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setMuted(newVolume === 0);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (hasError) {
    return (
      <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-sm">Video not available</div>
          <div className="text-xs mt-1">"{title}" demonstration</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-black ${className}`}>
      <video
        ref={videoRef}
        src={src}
        className="w-full h-40 object-cover"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          onEnded?.();
          onPause?.();
        }}
        onError={() => setHasError(true)}
        playsInline
        muted={muted}
      />
      
      {/* 控制层 */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent">
        {/* 进度条 */}
        <div className="px-3 pb-2">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) 100%)`
            }}
          />
        </div>
        
        {/* 控制按钮 */}
        <div className="flex items-center justify-between px-3 pb-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={togglePlay}
              className="flex items-center justify-center w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>
            
            <button
              onClick={toggleMute}
              className="text-white hover:text-gray-300 transition-colors"
            >
              {muted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div className="text-white text-xs">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>
    </div>
  );
});

MiniVideoPlayer.displayName = 'MiniVideoPlayer';

export default EnhancedTrainingProgress;