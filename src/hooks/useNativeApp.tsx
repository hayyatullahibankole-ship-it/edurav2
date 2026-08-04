import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

const getNativePlatform = (): 'ios' | 'android' | 'web' => {
  if (typeof Capacitor === 'undefined') return 'web';
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
};

export const useNativeApp = () => {
  const [isNative, setIsNative] = useState(() => {
    return typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform();
  });
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>(getNativePlatform);

  useEffect(() => {
    const native = Capacitor.isNativePlatform();
    setIsNative(native);
    setPlatform(Capacitor.getPlatform() as 'ios' | 'android' | 'web');
  }, []);

  return { isNative, platform };
};
