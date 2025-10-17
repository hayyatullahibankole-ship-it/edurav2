import { useEffect, useState } from "react";
import eduraLogo from "@/assets/edura-logo.png";

interface LoadingAnimationProps {
  message?: string;
}

const LoadingAnimation = ({ message = "Loading..." }: LoadingAnimationProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 10;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8">
      {/* Animated Logo Container */}
      <div className="relative">
        {/* Pulsing Rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full border-4 border-primary/20 animate-ping" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-28 h-28 rounded-full border-4 border-secondary/30 animate-pulse" style={{ animationDelay: '0.2s' }} />
        </div>
        
        {/* Logo with Book Opening Effect */}
        <div className="relative z-10 w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent rounded-2xl animate-spin-slow opacity-20" />
          <img 
            src={eduraLogo} 
            alt="Edura" 
            className="w-20 h-20 object-contain animate-bounce-subtle drop-shadow-2xl"
          />
        </div>

        {/* Orbiting Dots */}
        <div className="absolute inset-0 flex items-center justify-center animate-spin-slow">
          <div className="relative w-32 h-32">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full animate-pulse" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '0.33s' }} />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.66s' }} />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-warning rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-300 animate-gradient-shift bg-[length:200%_200%]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Loading Text */}
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold text-foreground animate-pulse">
          {message}
        </p>
        <div className="flex gap-1 justify-center">
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
          <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
