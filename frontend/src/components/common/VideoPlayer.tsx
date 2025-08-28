import React, { useState, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Loader } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  title?: string;
  className?: string;
  autoPlay?: boolean;
  showControls?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title,
  className = '',
  autoPlay = false,
  showControls = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const restart = () => {
    if (!videoRef.current) return;
    
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    
    const { currentTime, duration } = videoRef.current;
    const progressPercent = (currentTime / duration) * 100;
    setProgress(progressPercent);
  };

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  if (hasError) {
    return (
      <div className={`bg-gray-100 rounded-lg p-6 text-center ${className}`}>
        <div className="text-gray-500 mb-2">
          <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Video not available</p>
          <p className="text-xs text-gray-400 mt-1">
            {title ? `"${title}" demonstration video` : 'Demonstration video'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      {title && (
        <div className="bg-gray-800 text-white px-3 py-2 text-sm font-medium">
          🎥 {title}
        </div>
      )}
      
      <div className="relative">
        <video
          ref={videoRef}
          src={src}
          className="w-full h-auto"
          onLoadStart={handleLoadStart}
          onCanPlay={handleCanPlay}
          onError={handleError}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          muted={isMuted}
          playsInline
        />
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Loader className="h-8 w-8 text-white animate-spin" />
          </div>
        )}
        
        {/* Progress bar */}
        {showControls && !isLoading && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent">
            <div className="px-3 pb-3">
              <div className="w-full bg-white/30 rounded-full h-1 mb-2">
                <div
                  className="bg-blue-500 h-1 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control buttons */}
      {showControls && !isLoading && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex items-center justify-center gap-2 p-3">
            <button
              onClick={togglePlay}
              className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </button>
            
            <button
              onClick={restart}
              className="flex items-center justify-center w-8 h-8 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
              title="Restart"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            
            <button
              onClick={toggleMute}
              className="flex items-center justify-center w-8 h-8 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;