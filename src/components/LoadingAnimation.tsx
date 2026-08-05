import eduraLogo from "@/assets/edura-logo.png";

const LoadingAnimation = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-8">
        {/* Opening book */}
        <div className="relative" style={{ perspective: "900px" }}>
          <div className="relative flex items-end" style={{ transformStyle: "preserve-3d" }}>
            {/* Left cover */}
            <div className="h-24 w-20 rounded-l-md bg-primary/15 border border-primary/30 origin-right animate-book-left" />

            {/* Spine + logo */}
            <div className="relative z-10 h-24 w-8 bg-primary/25 border-y border-primary/30 flex items-center justify-center">
              <img src={eduraLogo} alt="Edura" className="w-6 h-6 object-contain animate-float" />
            </div>

            {/* Right cover */}
            <div className="h-24 w-20 rounded-r-md bg-primary/15 border border-primary/30 origin-left animate-book-right" />

            {/* Flipping pages */}
            <div className="absolute left-1/2 bottom-0 h-[86px] w-20 origin-left bg-card border border-primary/20 rounded-r-sm animate-page-flip" />
            <div
              className="absolute left-1/2 bottom-0 h-[86px] w-20 origin-left bg-card border border-primary/20 rounded-r-sm animate-page-flip"
              style={{ animationDelay: "0.5s" }}
            />
          </div>

          {/* Soft glow under the book */}
          <div className="mx-auto mt-3 h-2 w-32 rounded-full bg-primary/20 blur-md animate-pulse" />
        </div>

        {/* Wordmark */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-semibold tracking-[0.35em] uppercase text-muted-foreground">
            Edura
          </p>
          <div className="h-1 w-40 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/3 rounded-full bg-primary animate-loading-sweep" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
