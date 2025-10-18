import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GraduationCap, Target, Trophy, Zap, ChevronRight, ChevronLeft } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const onboardingSlides = [
  {
    icon: GraduationCap,
    title: 'Master Your Exams',
    description: 'Access thousands of past questions for JAMB, WAEC, NECO, and Post-UTME. Practice anywhere, anytime.',
    gradient: 'from-primary via-secondary to-info',
    image: '📚'
  },
  {
    icon: Target,
    title: 'Track Your Progress',
    description: 'Monitor your performance with detailed analytics. See where you excel and what needs improvement.',
    gradient: 'from-secondary via-accent to-success',
    image: '📊'
  },
  {
    icon: Trophy,
    title: 'Compete & Win',
    description: 'Join the Challenge Arena, compete with students nationwide, and climb the leaderboard to win prizes.',
    gradient: 'from-warning via-destructive to-accent',
    image: '🏆'
  },
  {
    icon: Zap,
    title: 'Study Smarter',
    description: 'Get instant access to expert tutors, comprehensive study materials, and personalized guidance.',
    gradient: 'from-accent via-primary to-secondary',
    image: '⚡'
  }
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

  const handlePrev = async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
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
  const Icon = slide.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Skip Button */}
      <div className="absolute top-6 right-6 z-20">
        <Button
          variant="ghost"
          onClick={handleSkip}
          className="text-muted-foreground hover:text-foreground"
        >
          Skip
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        {/* Slide Content with Animation */}
        <div className="w-full max-w-md animate-fade-in" key={currentSlide}>
          <Card className={`relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br ${slide.gradient} p-8 mb-8`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 text-center">
              {/* Icon */}
              <div className="mb-6 flex justify-center">
                <div className="w-28 h-28 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-6xl shadow-xl">
                  {slide.image}
                </div>
              </div>
              
              {/* Icon Badge */}
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <Icon className="h-12 w-12 text-white" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
                {slide.title}
              </h2>

              {/* Description */}
              <p className="text-lg text-white/90 leading-relaxed">
                {slide.description}
              </p>
            </div>
          </Card>

          {/* Slide Indicators */}
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
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="p-6 pb-8 space-y-3">
        <Button
          onClick={handleNext}
          className="w-full h-14 text-lg font-semibold shadow-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
        >
          {currentSlide === onboardingSlides.length - 1 ? (
            <>
              Get Started
              <ChevronRight className="ml-2 h-5 w-5" />
            </>
          ) : (
            <>
              Next
              <ChevronRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>

        {currentSlide > 0 && (
          <Button
            onClick={handlePrev}
            variant="outline"
            className="w-full h-14 text-lg font-semibold"
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            Previous
          </Button>
        )}
      </div>
    </div>
  );
};

export default MobileOnboarding;
