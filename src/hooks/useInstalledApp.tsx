import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useNativeApp } from './useNativeApp';

const getInstalledAppState = () => {
  const isPWA = typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );

  const isNative = typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform();

  return Boolean(isPWA || isNative);
};

export const useInstalledApp = () => {
  const { isNative } = useNativeApp();
  const [isInstalled, setIsInstalled] = useState(getInstalledAppState);

  useEffect(() => {
    setIsInstalled(getInstalledAppState() || isNative);
  }, [isNative]);

  return { isInstalledApp: isInstalled };
};
