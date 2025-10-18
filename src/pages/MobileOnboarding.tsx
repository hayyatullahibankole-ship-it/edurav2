import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const onboardingSlides = [
  {
    title: 'Practice Anytime, Anywhere',
    subtitle: 'Master JAMB, WAEC, NECO & Post-UTME',
    description: 'Access thousands of past questions with real exam simulation',
    image: '📱',
    gradient: 'from-primary to-secondary',
  },
  {
    title: 'Track Your Progress',
    subtitle: 'Data-driven insights',
    description: 'Monitor performance, identify weak areas, and improve systematically',
    image: '📊',
    gradient: 'from-secondary to-accent',
  },
  {
    title: 'Compete & Excel',
    subtitle: 'Challenge Arena',
    description: 'Join nationwide competitions, climb leaderboards, win amazing prizes',
    image: '🏆',
    gradient: 'from-accent to-success',
  },
];

const MobileOnboarding = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
    
    if (currentSlide === onboardingSlides.length - 1) {
      localStorage.setItem('hasSeenMobileOnboarding', 'true');
      navigate('/auth');
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handleSkip = async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
    localStorage.setItem('hasSeenMobileOnboarding', 'true');
    navigate('/auth');
  };

  const slide = onboardingSlides[currentSlide];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Skip Button */}
      <div className="absolute top-6 right-6 z-20">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          className="text-muted-foreground"
        >
          Skip
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Image Section */}
        <div className={`flex-1 bg-gradient-to-br ${slide.gradient} flex items-center justify-center relative overflow-hidden`}>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
          
          <div className="relative z-10 text-center px-6 animate-fade-in" key={currentSlide}>
            <div className="text-9xl mb-8 animate-float">{slide.image}</div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-background p-8 rounded-t-[2rem] -mt-8 relative z-10 shadow-2xl">
          <div className="text-center mb-8 animate-fade-in" key={`content-${currentSlide}`}>
            <h2 className="text-3xl font-bold mb-2">{slide.title}</h2>
            <p className="text-primary font-semibold text-lg mb-3">{slide.subtitle}</p>
            <p className="text-muted-foreground text-base leading-relaxed">
              {slide.description}
            </p>
          </div>

          {/* Indicators */}
          <div className="flex justify-center gap-2 mb-8">
            {onboardingSlides.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Button */}
          <Button
            onClick={handleNext}
            className="w-full h-14 text-lg font-semibold rounded-2xl shadow-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
          >
            {currentSlide === onboardingSlides.length - 1 ? "Let's Go" : 'Next'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileOnboarding;
