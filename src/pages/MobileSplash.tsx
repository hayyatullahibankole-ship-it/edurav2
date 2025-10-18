import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

const MobileSplash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const initApp = async () => {
      try {
        // Only use native APIs if on native platform
        if (Capacitor.isNativePlatform()) {
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#0ea5e9' });
        }
        
        // Auto navigate after short delay
        setTimeout(async () => {
          if (Capacitor.isNativePlatform()) {
            await SplashScreen.hide();
          }
          
          const hasSeenOnboarding = localStorage.getItem('hasSeenMobileOnboarding');
          navigate(hasSeenOnboarding ? '/auth' : '/mobile-onboarding');
        }, 1800);
      } catch (error) {
        console.error('Error initializing app:', error);
        setTimeout(() => {
          const hasSeenOnboarding = localStorage.getItem('hasSeenMobileOnboarding');
          navigate(hasSeenOnboarding ? '/auth' : '/mobile-onboarding');
        }, 1800);
      }
    };

    initApp();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-glow to-secondary flex items-center justify-center relative overflow-hidden">
      {/* Animated circles */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      
      {/* Logo */}
      <div className="relative z-10 text-center animate-fade-in">
        <div className="bg-white rounded-3xl p-6 shadow-2xl inline-block mb-4">
          <img src="/src/assets/edura-logo.png" alt="Edura" className="h-16 w-auto" />
        </div>
        <h1 className="text-3xl font-bold text-white">Edura CBT</h1>
      </div>
    </div>
  );
};

export default MobileSplash;
