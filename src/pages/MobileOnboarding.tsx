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
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50 flex flex-col relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Skip Button */}
      <div className="absolute top-8 right-6 z-20">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          className="text-muted-foreground hover:text-foreground font-semibold rounded-[16px] hover:bg-muted/50 backdrop-blur-sm"
        >
          Skip
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Top Section with Gradient */}
        <div className={`flex-1 bg-gradient-to-br ${slide.gradient} flex items-center justify-center relative overflow-hidden`}>
          {/* Curved Bottom Shape */}
          <div className="absolute bottom-0 left-0 right-0 h-12">
            <svg viewBox="0 0 1440 48" fill="none" className="w-full h-full">
              <path d="M0 48H1440V0C1440 0 1080 48 720 48C360 48 0 0 0 0V48Z" fill="hsl(var(--background))" />
            </svg>
          </div>

          {/* Animated Background Orbs */}
          <div className="absolute inset-0">
            <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
            <div className="absolute bottom-20 left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          
          {/* Image Container */}
          <div className="relative z-10 px-8 animate-fade-in-up" key={currentSlide}>
            <div className="relative mx-auto max-w-sm">
              {/* Glow Effect */}
              <div className="absolute -inset-6 bg-white/20 rounded-[40px] blur-3xl" />
              
              {/* Image Frame */}
              <div 
                className="relative bg-white/15 backdrop-blur-xl p-4 rounded-[32px] shadow-2xl border border-white/30"
                style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.3)' }}
              >
                <div className="relative overflow-hidden rounded-[24px] aspect-[4/3]">
                  <img 
                    src={slide.image} 
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-background px-8 pt-10 pb-8 relative">
          <div className="text-center mb-8 animate-fade-in" key={`content-${currentSlide}`} style={{ animationDelay: '0.2s' }}>
            <h2 className="text-4xl font-black mb-3 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent leading-tight">
              {slide.title}
            </h2>
            <p className="text-primary font-bold text-xl mb-4">{slide.subtitle}</p>
            <p className="text-muted-foreground text-base leading-relaxed max-w-md mx-auto font-medium">
              {slide.description}
            </p>
          </div>

          {/* Indicators */}
          <div className="flex justify-center gap-2.5 mb-8">
            {onboardingSlides.map((_, index) => (
              <div
                key={index}
                className={`h-2.5 rounded-full transition-all duration-300 shadow-lg ${
                  index === currentSlide
                    ? 'w-10 bg-gradient-to-r from-primary to-primary-glow'
                    : 'w-2.5 bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Button */}
          <Button
            onClick={handleNext}
            className="w-full h-16 text-lg font-black rounded-[24px] shadow-2xl bg-gradient-to-r from-primary via-primary-glow to-secondary hover:scale-[1.02] active:scale-[0.98] transition-all"
            style={{ boxShadow: '0 12px 36px rgba(var(--primary), 0.4)' }}
          >
            {currentSlide === onboardingSlides.length - 1 ? "Get Started" : 'Next'}
            <ArrowRight className="ml-2 h-6 w-6" strokeWidth={2.5} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileOnboarding;
