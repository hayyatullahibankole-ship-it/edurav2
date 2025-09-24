/**
 * Anti-cheat and proctoring utilities
 */

interface SuspiciousActivity {
  type: 'tab_switch' | 'copy_attempt' | 'paste_attempt' | 'right_click' | 'fullscreen_exit' | 'multiple_sessions';
  timestamp: number;
  details?: any;
}

class AntiCheatMonitor {
  private activities: SuspiciousActivity[] = [];
  private listeners: Array<() => void> = [];
  private isActive = false;
  private tabSwitchCount = 0;
  private sessionId = this.generateSessionId();

  constructor() {
    this.setupEventListeners();
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private setupEventListeners() {
    // Detect tab switching / window blur
    window.addEventListener('blur', () => {
      if (this.isActive) {
        this.tabSwitchCount++;
        this.logActivity('tab_switch', { count: this.tabSwitchCount });
      }
    });

    // Detect copy attempts
    document.addEventListener('copy', (e) => {
      if (this.isActive) {
        e.preventDefault();
        this.logActivity('copy_attempt');
      }
    });

    // Detect paste attempts
    document.addEventListener('paste', (e) => {
      if (this.isActive) {
        e.preventDefault();
        this.logActivity('paste_attempt');
      }
    });

    // Detect right-click
    document.addEventListener('contextmenu', (e) => {
      if (this.isActive) {
        e.preventDefault();
        this.logActivity('right_click');
      }
    });

    // Detect fullscreen exit
    document.addEventListener('fullscreenchange', () => {
      if (this.isActive && !document.fullscreenElement) {
        this.logActivity('fullscreen_exit');
      }
    });

    // Detect keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (this.isActive) {
        // Block common shortcuts
        if (e.ctrlKey || e.metaKey) {
          const blockedKeys = ['c', 'v', 'a', 's', 'p', 'f', 'r', 'u', 'i'];
          if (blockedKeys.includes(e.key.toLowerCase())) {
            e.preventDefault();
            this.logActivity('copy_attempt', { key: e.key });
          }
        }
        
        // Block F12, F5, etc.
        if (['F5', 'F11', 'F12'].includes(e.key)) {
          e.preventDefault();
        }
      }
    });
  }

  startMonitoring() {
    this.isActive = true;
    this.activities = [];
    this.tabSwitchCount = 0;
    
    // Request fullscreen
    document.documentElement.requestFullscreen().catch(() => {
      console.warn('Fullscreen not supported or denied');
    });
  }

  stopMonitoring() {
    this.isActive = false;
    
    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }

  private logActivity(type: SuspiciousActivity['type'], details?: any) {
    const activity: SuspiciousActivity = {
      type,
      timestamp: Date.now(),
      details
    };
    
    this.activities.push(activity);
    
    // Notify listeners
    this.listeners.forEach(callback => callback());
    
    console.warn('Suspicious activity detected:', activity);
  }

  getActivities(): SuspiciousActivity[] {
    return [...this.activities];
  }

  getSuspicionScore(): number {
    const weights = {
      tab_switch: 2,
      copy_attempt: 3,
      paste_attempt: 3,
      right_click: 1,
      fullscreen_exit: 2,
      multiple_sessions: 5
    };

    return this.activities.reduce((score, activity) => {
      return score + (weights[activity.type] || 1);
    }, 0);
  }

  isSuspicious(threshold = 5): boolean {
    return this.getSuspicionScore() > threshold;
  }

  onActivityDetected(callback: () => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  getDeviceFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }

    return btoa(JSON.stringify({
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvasFingerprint: canvas.toDataURL(),
      sessionId: this.sessionId
    }));
  }

  async checkMultipleSessions(userId: string): Promise<boolean> {
    try {
      // This would typically check with your backend
      const response = await fetch('/api/check-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          fingerprint: this.getDeviceFingerprint() 
        })
      });
      
      const data = await response.json();
      
      if (data.multipleSessions) {
        this.logActivity('multiple_sessions', { sessionCount: data.sessionCount });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to check multiple sessions:', error);
      return false;
    }
  }
}

// Webcam proctoring utilities
class WebcamProctor {
  private stream: MediaStream | null = null;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private video: HTMLVideoElement;
  private isRecording = false;
  private snapshots: string[] = [];

  constructor() {
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d')!;
    this.video = document.createElement('video');
    this.video.autoplay = true;
    this.video.muted = true;
  }

  async requestPermission(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
      });
      
      this.video.srcObject = this.stream;
      return true;
    } catch (error) {
      console.error('Webcam permission denied:', error);
      return false;
    }
  }

  startRecording(intervalMs = 30000) { // Capture every 30 seconds
    if (!this.stream || this.isRecording) return;
    
    this.isRecording = true;
    
    const captureFrame = () => {
      if (!this.isRecording) return;
      
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
      this.context.drawImage(this.video, 0, 0);
      
      const snapshot = this.canvas.toDataURL('image/jpeg', 0.8);
      this.snapshots.push(snapshot);
      
      // Keep only last 10 snapshots
      if (this.snapshots.length > 10) {
        this.snapshots.shift();
      }
      
      setTimeout(captureFrame, intervalMs);
    };
    
    setTimeout(captureFrame, intervalMs);
  }

  stopRecording() {
    this.isRecording = false;
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  getSnapshots(): string[] {
    return [...this.snapshots];
  }

  cleanup() {
    this.stopRecording();
    this.snapshots = [];
  }
}

// Export singleton instances
export const antiCheatMonitor = new AntiCheatMonitor();
export const webcamProctor = new WebcamProctor();

// Utility functions
export function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

export function validateExamEnvironment(): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Check if DevTools might be open
  if (window.outerHeight - window.innerHeight > 100 || 
      window.outerWidth - window.innerWidth > 100) {
    issues.push('Developer tools may be open');
  }
  
  // Check for extensions or unusual properties
  if ((window as any).chrome && (window as any).chrome.runtime) {
    issues.push('Browser extensions detected');
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}
