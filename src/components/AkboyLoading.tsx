import akboyLogo from "@/assets/akboy-logo.png";

/**
 * Akboy-branded loading state.
 * Deliberately shares no assets or wording with the Edura loader.
 */
const AkboyLoading = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-akboy-bone">
      <div className="flex flex-col items-center gap-7">
        <div className="relative h-24 w-24">
          <span className="absolute inset-0 rounded-full border border-akboy-forest/35 animate-loader-ping" />
          <span
            className="absolute inset-0 rounded-full border border-akboy-forest/25 animate-loader-ping"
            style={{ animationDelay: "0.4s" }}
          />
          <span
            className="absolute inset-0 rounded-full border border-akboy-butter/60 animate-loader-ping"
            style={{ animationDelay: "0.8s" }}
          />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-akboy-forest shadow-sm animate-pulse-subtle">
              <img src={akboyLogo} alt="Akboy" className="h-9 w-9 object-contain" />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <p className="font-display text-sm font-semibold tracking-[0.25em] uppercase text-akboy-forest">
            Akboy
          </p>
          <div className="h-1 w-36 overflow-hidden rounded-full bg-akboy-line">
            <div className="h-full w-1/3 rounded-full bg-akboy-butter animate-loading-sweep" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AkboyLoading;
