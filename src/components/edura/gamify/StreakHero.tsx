import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import ProgressRing from "./ProgressRing";
import { streakMessage } from "@/lib/gamify";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

/**
 * Home hero: greeting, streak ring, week strip and a level bar. This is the
 * first thing a student sees, so it answers "how am I doing?" in one glance.
 */
export const StreakHero = ({
  name,
  streak,
  practisedToday,
  level,
  levelTitle,
  levelProgress,
  xp,
}: {
  name: string;
  streak: number;
  practisedToday: boolean;
  level: number;
  levelTitle: string;
  levelProgress: number;
  xp: number;
}) => {
  const todayIdx = (new Date().getDay() + 6) % 7; // Monday-first
  const ringValue = Math.min(100, (Math.min(streak, 7) / 7) * 100);

  return (
    <section className="app-card overflow-hidden p-5 animate-screen-in">
      <div className="flex items-center gap-4">
        <ProgressRing value={ringValue} size={82}>
          <Flame
            className={cn(
              "h-5 w-5",
              streak > 0 ? "text-primary" : "text-muted-foreground"
            )}
          />
          <span className="font-display text-lg font-bold leading-none tabular">{streak}</span>
        </ProgressRing>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">
            {greeting()}, {name}
          </p>
          <h2 className="font-display text-lg font-bold leading-tight">
            {streak > 0 ? `${streak}-day streak` : "Let's get started"}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {streakMessage(streak, practisedToday)}
          </p>
        </div>
      </div>

      {/* Week strip */}
      <div className="mt-4 flex items-center justify-between gap-1.5">
        {DAYS.map((d, i) => {
          const active = i <= todayIdx && todayIdx - i < Math.min(streak, 7);
          return (
            <div key={`${d}-${i}`} className="flex flex-1 flex-col items-center gap-1">
              <div
                className={cn(
                  "h-1.5 w-full rounded-full transition-colors",
                  active ? "bg-primary" : "bg-muted"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-semibold",
                  i === todayIdx ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {d}
              </span>
            </div>
          );
        })}
      </div>

      {/* Level bar */}
      <div className="mt-4 rounded-xl bg-muted/60 p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold">
            Level {level} · {levelTitle}
          </span>
          <span className="tabular text-muted-foreground">{xp.toLocaleString()} XP</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-1000 ease-out"
            style={{ width: `${levelProgress}%` }}
          />
        </div>
      </div>
    </section>
  );
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

export default StreakHero;
