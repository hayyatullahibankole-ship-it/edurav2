import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Sparkles, GraduationCap } from 'lucide-react';

const MobileSplash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const initApp = async () => {
      try {
        // Configure status bar
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: '#0ea5e9' });
        
        // Hide splash screen after delay
        setTimeout(async () => {
          await SplashScreen.hide();
          
          // Check if user has seen onboarding
          const hasSeenOnboarding = localStorage.getItem('hasSeenMobileOnboarding');
          
          if (hasSeenOnboarding) {
            navigate('/auth');
          } else {
            navigate('/mobile-onboarding');
          }
        }, 2500);
      } catch (error) {
        console.error('Error initializing app:', error);
        navigate('/mobile-onboarding');
      }
    };

    initApp();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute top-20 left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-56 h-56 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      
      {/* Logo Container */}
      <div className="relative z-10 animate-scale-in">
        <div className="bg-white rounded-3xl p-8 shadow-2xl mb-8 relative">
          <div className="absolute -top-2 -right-2">
            <div className="bg-warning rounded-full p-2 shadow-lg animate-bounce">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          </div>
          <img src="/src/assets/edura-logo.png" alt="Edura" className="h-20 w-auto" />
        </div>
        
        <div className="text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Edura CBT
          </h1>
          <p className="text-white/90 text-lg flex items-center justify-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Your Path to Success
          </p>
        </div>
      </div>

      {/* Loading Indicator */}
      <div className="absolute bottom-20 animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
};

export default MobileSplash;
