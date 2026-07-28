// Sound utility for UI feedback
// Using Web Audio API with lightweight sound effects

class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private async loadSounds() {
    // Keep this method available but avoid remote fetches that can be blocked.
    // Local generated tones are used as the fallback path.
    return;
  }

  // Generate simple tones as fallback
  private generateTone(frequency: number, duration: number = 0.1): AudioBuffer | null {
    if (!this.audioContext) return null;
    
    const sampleRate = this.audioContext.sampleRate;
    const numSamples = duration * sampleRate;
    const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      // Create a soft sine wave with envelope
      const envelope = Math.exp(-3 * t);
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.15;
    }

    return buffer;
  }

  play(soundName: string, volume: number = 0.3) {
    if (!this.enabled || !this.audioContext) return;

    try {
      let buffer = this.sounds.get(soundName);

      if (!buffer) {
        const frequencies: { [key: string]: number } = {
          tap: 800,
          pop: 1200,
          whoosh: 600,
          success: 1000,
          click: 900,
        };
        buffer = this.generateTone(frequencies[soundName] || 800);
      }

      if (buffer) {
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = buffer;
        gainNode.gain.value = Math.min(volume, 0.5); // Cap volume at 0.5
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        source.start(0);
      }
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }

  // Play different sounds
  playTap() {
    this.play('tap', 0.2);
  }

  playPop() {
    this.play('pop', 0.25);
  }

  playWhoosh() {
    this.play('whoosh', 0.2);
  }

  playSuccess() {
    this.play('success', 0.3);
  }

  playClick() {
    this.play('click', 0.2);
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled() {
    return this.enabled;
  }
}

// Singleton instance
export const soundManager = new SoundManager();

// Helper functions
export const playTapSound = () => soundManager.playTap();
export const playPopSound = () => soundManager.playPop();
export const playWhooshSound = () => soundManager.playWhoosh();
export const playSuccessSound = () => soundManager.playSuccess();
export const playClickSound = () => soundManager.playClick();
