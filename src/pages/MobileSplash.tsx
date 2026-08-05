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
          await StatusBar.setBackgroundColor({ color: '#12B76A' });
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
    <div className="min-h-screen bg-primary flex items-center justify-center relative overflow-hidden">
      {/* Curved Shape at Top */}
      <div className="absolute top-0 left-0 right-0 h-64">
        <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none">
          <path 
            d="M0,160 C320,100 640,220 960,180 C1280,140 1440,200 1440,200 L1440,0 L0,0 Z" 
            fill="rgba(255, 255, 255, 0.05)"
          />
        </svg>
      </div>

      {/* Animated Background Orbs */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Floating Particles */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 bg-white/30 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }}
        />
      ))}
      
      {/* Logo Container */}
      <div className="relative z-10 text-center px-6">
        {/* Glow Ring */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/20 rounded-full blur-3xl animate-pulse" />
        </div>
        
        {/* Logo Card */}
        <div className="relative animate-fade-in-up">
          <div 
            className="bg-white/95 backdrop-blur-xl rounded-[32px] p-8 shadow-2xl inline-block mb-6 animate-scale-in hover:scale-105 transition-transform duration-500 relative overflow-hidden"
            style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.5)' }}
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-transparent opacity-0 animate-shine" />
            <img src={eduraLogo} alt="Edura" className="h-20 w-auto relative z-10" />
          </div>
          
          {/* Text */}
          <h1 className="text-5xl font-black text-white mb-2 drop-shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Edura CBT
          </h1>
          <p className="text-white/90 text-base font-semibold animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            Your Gateway to Success
          </p>
        </div>
        
        {/* Loading Indicator */}
        <div className="mt-10 flex justify-center gap-2.5 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 bg-white rounded-full shadow-lg animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileSplash;
