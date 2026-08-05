import eduraLogo from "@/assets/edura-logo.png";

const LoadingAnimation = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-7">
        {/* Pulse loader */}
        <div className="relative h-24 w-24">
          {/* Expanding rings */}
          <span className="absolute inset-0 rounded-full border border-primary/40 animate-loader-ping" />
          <span
            className="absolute inset-0 rounded-full border border-primary/30 animate-loader-ping"
            style={{ animationDelay: "0.4s" }}
          />
          <span
            className="absolute inset-0 rounded-full border border-primary/20 animate-loader-ping"
            style={{ animationDelay: "0.8s" }}
          />

          {/* Center logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm animate-pulse-subtle">
              <img src={eduraLogo} alt="Edura" className="h-9 w-9 object-contain" />
            </div>
          </div>
        </div>

        {/* Wordmark + progress */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm font-semibold tracking-[0.25em] uppercase text-muted-foreground">
            Edura
          </p>
          <div className="h-1 w-36 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/3 rounded-full bg-primary animate-loading-sweep" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
