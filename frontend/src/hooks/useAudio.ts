import { useCallback, useEffect, useRef, useState } from 'react';

interface AudioOptions {
  volume?: number;
  loop?: boolean;
  preload?: boolean;
}

interface AudioState {
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  error: string | null;
}

export const useAudio = (src: string, options: AudioOptions = {}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioState>({
    isPlaying: false,
    duration: 0,
    currentTime: 0,
    volume: options.volume ?? 0.7,
    error: null
  });

  const { volume = 0.7, loop = false, preload = true } = options;

  // 初始化音频
  useEffect(() => {
    if (!src) return;

    const audio = new Audio();
    audio.src = src;
    audio.volume = volume;
    audio.loop = loop;
    if (preload) {
      audio.preload = 'auto';
    }

    audioRef.current = audio;

    const updateState = (updates: Partial<AudioState>) => {
      setState(prev => ({ ...prev, ...updates }));
    };

    // 事件监听器
    const onLoadedMetadata = () => {
      updateState({ duration: audio.duration, error: null });
    };

    const onTimeUpdate = () => {
      updateState({ currentTime: audio.currentTime });
    };

    const onPlay = () => {
      updateState({ isPlaying: true });
    };

    const onPause = () => {
      updateState({ isPlaying: false });
    };

    const onEnded = () => {
      updateState({ isPlaying: false, currentTime: 0 });
    };

    const onError = () => {
      updateState({ error: 'Failed to load audio' });
    };

    const onVolumeChange = () => {
      updateState({ volume: audio.volume });
    };

    // 添加事件监听器
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('volumechange', onVolumeChange);

    return () => {
      // 清理事件监听器
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('volumechange', onVolumeChange);
      
      // 停止播放并清理资源
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [src, volume, loop, preload]);

  // 播放控制函数
  const play = useCallback(async () => {
    if (!audioRef.current) return false;
    
    try {
      await audioRef.current.play();
      return true;
    } catch (error) {
      console.error('Audio play failed:', error);
      setState(prev => ({ ...prev, error: 'Playback failed' }));
      return false;
    }
  }, []);

  const pause = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
  }, []);

  const stop = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    if (!audioRef.current) return;
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    audioRef.current.volume = clampedVolume;
  }, []);

  const setCurrentTime = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(state.duration, time));
  }, [state.duration]);

  const fadeIn = useCallback((duration: number = 1000) => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    const startVolume = 0;
    const endVolume = volume;
    
    audio.volume = startVolume;
    play();
    
    const fadeStep = (endVolume - startVolume) / (duration / 50);
    const fadeInterval = setInterval(() => {
      const newVolume = audio.volume + fadeStep;
      if (newVolume >= endVolume) {
        audio.volume = endVolume;
        clearInterval(fadeInterval);
      } else {
        audio.volume = newVolume;
      }
    }, 50);
  }, [play, volume]);

  const fadeOut = useCallback((duration: number = 1000) => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    const startVolume = audio.volume;
    const fadeStep = startVolume / (duration / 50);
    
    const fadeInterval = setInterval(() => {
      const newVolume = audio.volume - fadeStep;
      if (newVolume <= 0) {
        audio.volume = 0;
        pause();
        clearInterval(fadeInterval);
      } else {
        audio.volume = newVolume;
      }
    }, 50);
  }, [pause]);

  return {
    ...state,
    play,
    pause,
    stop,
    setVolume,
    setCurrentTime,
    fadeIn,
    fadeOut,
    audioElement: audioRef.current
  };
};

// 预定义的音效类型
export type SoundEffect = 
  | 'heartbeat'
  | 'compression'
  | 'breathing'
  | 'success'
  | 'error'
  | 'warning'
  | 'perfect'
  | 'combo'
  | 'tick'
  | 'emergency';

// 音效配置
export const SOUND_EFFECTS: Record<SoundEffect, string> = {
  heartbeat: '/sounds/heartbeat.mp3',
  compression: '/sounds/compression.mp3',
  breathing: '/sounds/breathing.mp3',
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  warning: '/sounds/warning.mp3',
  perfect: '/sounds/perfect.mp3',
  combo: '/sounds/combo.mp3',
  tick: '/sounds/tick.mp3',
  emergency: '/sounds/emergency.mp3'
};

// 多音效管理Hook
export const useMultiAudio = () => {
  const [audioInstances] = useState<Map<SoundEffect, ReturnType<typeof useAudio>>>(new Map());
  const [globalVolume, setGlobalVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);

  // 播放音效
  const playSound = useCallback((effect: SoundEffect, options: AudioOptions = {}) => {
    if (muted) return false;

    // 创建临时音频实例来播放一次性音效
    const audio = new Audio(SOUND_EFFECTS[effect]);
    audio.volume = (options.volume ?? globalVolume) * (muted ? 0 : 1);
    
    audio.play().catch(error => {
      console.warn(`Failed to play sound effect ${effect}:`, error);
    });

    return true;
  }, [globalVolume, muted]);

  // 播放循环音效（如心跳声）
  const playLoopingSound = useCallback((effect: SoundEffect, volume?: number) => {
    if (muted) return null;

    const audio = new Audio(SOUND_EFFECTS[effect]);
    audio.loop = true;
    audio.volume = (volume ?? globalVolume) * (muted ? 0 : 1);
    
    audio.play().catch(error => {
      console.warn(`Failed to play looping sound ${effect}:`, error);
    });

    return audio;
  }, [globalVolume, muted]);

  // 停止所有音效
  const stopAllSounds = useCallback(() => {
    audioInstances.forEach(instance => {
      instance.stop();
    });
  }, [audioInstances]);

  // 切换静音状态
  const toggleMute = useCallback(() => {
    setMuted(prev => !prev);
  }, []);

  return {
    playSound,
    playLoopingSound,
    stopAllSounds,
    globalVolume,
    setGlobalVolume,
    muted,
    setMuted,
    toggleMute
  };
};