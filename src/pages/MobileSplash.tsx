import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import eduraLogo from '@/assets/edura-logo.png';

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
      {/* Animated Background Orbs */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }}
        />
      ))}
      
      {/* Gradient Overlay Animation */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent animate-gradient-shift bg-[length:200%_200%]" />
      
      {/* Logo Container with Enhanced Effects */}
      <div className="relative z-10 text-center">
        {/* Glow Ring */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/20 rounded-full blur-3xl animate-pulse" />
        </div>
        
        {/* Logo Card with Animation */}
        <div className="relative animate-fade-in-up">
          <div className="bg-white rounded-3xl p-6 shadow-2xl inline-block mb-4 animate-scale-in hover:scale-110 transition-transform duration-500">
            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 animate-shine rounded-3xl" />
            <img src={eduraLogo} alt="Edura" className="h-16 w-auto relative z-10" />
          </div>
          
          {/* Text with Stagger Animation */}
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Edura CBT
          </h1>
          <p className="text-white/80 text-sm animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            Your Gateway to Success
          </p>
        </div>
        
        {/* Loading Indicator */}
        <div className="mt-8 flex justify-center gap-2 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-white rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileSplash;
