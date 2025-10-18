import { useState, useEffect } from 'react';
import { useNativeApp } from './useNativeApp';

export const useInstalledApp = () => {
  const { isNative } = useNativeApp();
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if running as installed PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone === true;
    
    setIsInstalled(isPWA || isNative);
  }, [isNative]);

  return { isInstalledApp: isInstalled };
};
