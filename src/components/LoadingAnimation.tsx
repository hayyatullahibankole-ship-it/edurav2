import { BookOpen } from "lucide-react";
import eduraLogo from "@/assets/edura-logo.png";

interface LoadingAnimationProps {
  message?: string;
}

const LoadingAnimation = ({ message = "Loading..." }: LoadingAnimationProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8">
      {/* Book Opening Animation */}
      <div className="relative w-32 h-32">
        {/* Book Pages Opening */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Left Page */}
          <div 
            className="absolute left-0 w-16 h-24 bg-primary/20 rounded-l-lg shadow-lg origin-right"
            style={{
              animation: 'openLeft 1.5s ease-in-out infinite',
              transformStyle: 'preserve-3d'
            }}
          />
          {/* Right Page */}
          <div 
            className="absolute right-0 w-16 h-24 bg-primary/20 rounded-r-lg shadow-lg origin-left"
            style={{
              animation: 'openRight 1.5s ease-in-out infinite',
              transformStyle: 'preserve-3d'
            }}
          />
        </div>
        
        {/* Logo in Center */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <img 
            src={eduraLogo} 
            alt="Edura" 
            className="w-16 h-16 object-contain drop-shadow-2xl animate-pulse"
          />
        </div>

        {/* Shimmer Effect */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          style={{
            animation: 'shimmer 2s ease-in-out infinite'
          }}
        />
      </div>

      {/* Loading Text */}
      <div className="text-center space-y-3">
        <p className="text-xl font-bold text-foreground">
          {message}
        </p>
        <div className="flex gap-2 justify-center">
          <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" />
          <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
          <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
        </div>
      </div>

      <style>{`
        @keyframes openLeft {
          0%, 100% { transform: perspective(400px) rotateY(0deg); }
          50% { transform: perspective(400px) rotateY(-25deg); }
        }
        @keyframes openRight {
          0%, 100% { transform: perspective(400px) rotateY(0deg); }
          50% { transform: perspective(400px) rotateY(25deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default LoadingAnimation;
