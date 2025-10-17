import eduraLogo from "@/assets/edura-logo.png";

const LoadingAnimation = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="relative flex flex-col items-center gap-6">
        {/* Animated logo container */}
        <div className="relative">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 -m-4">
            <div className="w-32 h-32 rounded-full border-4 border-transparent border-t-primary border-r-secondary animate-spin" />
          </div>
          
          {/* Middle pulsing ring */}
          <div className="absolute inset-0 -m-2">
            <div className="w-28 h-28 rounded-full border-2 border-primary/30 animate-pulse" />
          </div>
          
          {/* Logo with float animation */}
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 p-4 animate-float">
            <img 
              src={eduraLogo} 
              alt="Edura Logo" 
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 -z-10 blur-2xl opacity-50">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-secondary animate-pulse" />
          </div>
        </div>
        
        {/* Loading text with gradient */}
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-xl font-bold text-gradient-animate">
            Loading
          </h3>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
