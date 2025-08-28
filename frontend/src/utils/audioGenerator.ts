// Web Audio API 音效生成工具
// 用于生成基础音效，实际项目中应该使用专业录制的音频文件

export class AudioGenerator {
  private audioContext: AudioContext | null = null;

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // 生成简单的提示音
  generateTone(frequency: number, duration: number, type: OscillatorType = 'sine'): Promise<void> {
    return new Promise((resolve) => {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      oscillator.type = type;

      // 音量包络
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);

      oscillator.onended = () => resolve();
    });
  }

  // 成功音效 (C大调和弦)
  async playSuccessSound(): Promise<void> {
    await this.generateTone(523.25, 0.2); // C5
    await this.generateTone(659.25, 0.2); // E5
    await this.generateTone(783.99, 0.3); // G5
  }

  // 错误音效 (低频不和谐音)
  async playErrorSound(): Promise<void> {
    await Promise.all([
      this.generateTone(200, 0.5, 'sawtooth'),
      this.generateTone(180, 0.5, 'sawtooth')
    ]);
  }

  // 完美音效 (上升音阶)
  async playPerfectSound(): Promise<void> {
    const notes = [523.25, 587.33, 659.25, 698.46, 783.99]; // C-D-E-F-G
    for (const note of notes) {
      await this.generateTone(note, 0.15);
    }
  }

  // 连击音效
  async playComboSound(): Promise<void> {
    await Promise.all([
      this.generateTone(880, 0.3, 'square'),
      this.generateTone(1108.73, 0.3, 'square')
    ]);
  }

  // 心跳音效 (双音效模拟"lub-dub")
  async playHeartbeatSound(): Promise<void> {
    // Lub (低频, 短)
    await this.generateTone(60, 0.1, 'sine');
    await new Promise(resolve => setTimeout(resolve, 50));
    // Dub (稍高频, 短)
    await this.generateTone(80, 0.08, 'sine');
  }

  // 按压音效
  async playCompressionSound(): Promise<void> {
    await this.generateTone(150, 0.1, 'square');
  }

  // 警告音效
  async playWarningSound(): Promise<void> {
    await this.generateTone(800, 0.2);
    await new Promise(resolve => setTimeout(resolve, 100));
    await this.generateTone(600, 0.2);
  }

  // 倒计时滴答音效
  async playTickSound(): Promise<void> {
    await this.generateTone(1000, 0.05, 'square');
  }

  // 紧急警报音效
  async playEmergencySound(): Promise<void> {
    for (let i = 0; i < 3; i++) {
      await this.generateTone(1000, 0.2, 'sawtooth');
      await this.generateTone(800, 0.2, 'sawtooth');
    }
  }

  // 清理资源
  dispose(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// 全局音效生成器实例
export const audioGenerator = new AudioGenerator();

// 便捷的音效播放函数
export const playGeneratedSound = {
  success: () => audioGenerator.playSuccessSound(),
  error: () => audioGenerator.playErrorSound(),
  perfect: () => audioGenerator.playPerfectSound(),
  combo: () => audioGenerator.playComboSound(),
  heartbeat: () => audioGenerator.playHeartbeatSound(),
  compression: () => audioGenerator.playCompressionSound(),
  warning: () => audioGenerator.playWarningSound(),
  tick: () => audioGenerator.playTickSound(),
  emergency: () => audioGenerator.playEmergencySound()
};