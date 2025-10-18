import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import onboardingStudy from '@/assets/onboarding-study.jpg';
import onboardingExam from '@/assets/onboarding-exam.jpg';
import onboardingSuccess from '@/assets/onboarding-success.jpg';

const onboardingSlides = [
  {
    title: 'Practice Anytime, Anywhere',
    subtitle: 'Master JAMB, WAEC, NECO & Post-UTME',
    description: 'Access thousands of past questions with real exam simulation',
    image: onboardingStudy,
    gradient: 'from-primary to-secondary',
  },
  {
    title: 'Ace Your Exams',
    subtitle: 'Focused preparation',
    description: 'Take timed practice tests that mirror real exam conditions',
    image: onboardingExam,
    gradient: 'from-secondary to-accent',
  },
  {
    title: 'Celebrate Success',
    subtitle: 'Achieve your dreams',
    description: 'Join thousands of students who achieved excellence with Edura',
    image: onboardingSuccess,
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
        {/* Top Section with Gradient */}
        <div className={`relative bg-gradient-to-br ${slide.gradient} pt-16 pb-8 px-6`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />
          
          {/* Image Container - Framed */}
          <div className="relative z-10 animate-fade-in-up" key={currentSlide}>
            <div className="relative mx-auto max-w-sm">
              {/* Decorative ring */}
              <div className="absolute -inset-4 bg-white/20 rounded-3xl blur-2xl" />
              
              {/* Image Frame */}
              <div className="relative bg-white/10 backdrop-blur-md p-3 rounded-3xl shadow-2xl border border-white/30">
                <div className="relative overflow-hidden rounded-2xl aspect-[4/3]">
                  <img 
                    src={slide.image} 
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 bg-background px-8 pt-8 pb-6">
          <div className="text-center mb-6 animate-fade-in" key={`content-${currentSlide}`} style={{ animationDelay: '0.2s' }}>
            <h2 className="text-2xl font-bold mb-2 text-foreground">{slide.title}</h2>
            <p className="text-primary font-semibold text-base mb-3">{slide.subtitle}</p>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
              {slide.description}
            </p>
          </div>

          {/* Indicators */}
          <div className="flex justify-center gap-2 mb-6">
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
            className="w-full h-12 text-base font-semibold rounded-xl shadow-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {currentSlide === onboardingSlides.length - 1 ? "Get Started" : 'Continue'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileOnboarding;
