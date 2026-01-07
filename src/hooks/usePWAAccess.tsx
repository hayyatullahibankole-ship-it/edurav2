import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

export type AccessLevel = 'full' | 'limited';
export type Platform = 'desktop' | 'mobile-pwa' | 'mobile-browser';

interface PWAAccessState {
  platform: Platform;
  accessLevel: AccessLevel;
  isDesktop: boolean;
  isMobilePWA: boolean;
  isMobileBrowser: boolean;
  requiresPWA: boolean;
  isLoading: boolean;
}

// Features that require PWA on mobile
const PWA_REQUIRED_FEATURES = [
  'full-cbt-exam',
  'exam-mode',
  'performance-analytics',
  'offline-practice',
  'push-notifications',
  'saved-content',
  'progress-tracking',
  'weak-topic-analysis',
] as const;

export type PWARequiredFeature = typeof PWA_REQUIRED_FEATURES[number];

export const usePWAAccess = () => {
  const [state, setState] = useState<PWAAccessState>({
    platform: 'desktop',
    accessLevel: 'full',
    isDesktop: true,
    isMobilePWA: false,
    isMobileBrowser: false,
    requiresPWA: false,
    isLoading: true,
  });

  useEffect(() => {
    const detectPlatform = (): Platform => {
      // Check if running as native app (Capacitor)
      if (Capacitor.isNativePlatform()) {
        return 'mobile-pwa'; // Native apps have full access
      }

      // Check if desktop
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

      if (!isMobile) {
        return 'desktop';
      }

      // Check if installed as PWA
      const isStandalone = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');

      return isStandalone ? 'mobile-pwa' : 'mobile-browser';
    };

    const platform = detectPlatform();
    const isDesktop = platform === 'desktop';
    const isMobilePWA = platform === 'mobile-pwa';
    const isMobileBrowser = platform === 'mobile-browser';
    
    // Mobile browser users have limited access
    const accessLevel: AccessLevel = isMobileBrowser ? 'limited' : 'full';
    const requiresPWA = isMobileBrowser;

    setState({
      platform,
      accessLevel,
      isDesktop,
      isMobilePWA,
      isMobileBrowser,
      requiresPWA,
      isLoading: false,
    });
  }, []);

  // Check if a specific feature requires PWA installation
  const requiresPWAForFeature = useCallback((feature: PWARequiredFeature): boolean => {
    if (state.isLoading) return false;
    return state.isMobileBrowser && PWA_REQUIRED_FEATURES.includes(feature);
  }, [state.isLoading, state.isMobileBrowser]);

  // Check if user can access a feature
  const canAccessFeature = useCallback((feature: PWARequiredFeature): boolean => {
    if (state.isLoading) return true; // Optimistic during load
    if (state.isDesktop || state.isMobilePWA) return true;
    return !PWA_REQUIRED_FEATURES.includes(feature);
  }, [state.isLoading, state.isDesktop, state.isMobilePWA]);

  return {
    ...state,
    requiresPWAForFeature,
    canAccessFeature,
  };
};
