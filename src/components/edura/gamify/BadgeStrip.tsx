import { Award, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BadgeDef } from "@/lib/gamify";

/**
 * Horizontal achievement rail. Locked badges stay visible on purpose — the
 * next milestone is the motivation.
 */
export const BadgeStrip = ({ badges }: { badges: BadgeDef[] }) => (
  <div className="rail no-scrollbar -mx-1 px-1 pb-1">
    {badges.map((b, i) => (
      <div
        key={b.id}
        className={cn(
          "w-[124px] rounded-2xl border p-3 animate-pop-in",
          b.earned ? "border-primary/40 bg-primary/5" : "bg-card",
          `stagger-${Math.min(i + 1, 5)}`
        )}
      >
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            b.earned ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}
        >
          {b.earned ? <Award className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
        </div>
        <p className="mt-2 text-xs font-semibold leading-tight">{b.label}</p>
        <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">{b.hint}</p>
      </div>
    ))}
  </div>
);

export default BadgeStrip;
