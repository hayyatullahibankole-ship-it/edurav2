import { GraduationCap, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppSide, type AppSide } from "@/hooks/useAppSide";
import { cn } from "@/lib/utils";
import { readCachedStage } from "@/hooks/useAcademicStage";
import { isCampusStage } from "@/lib/academicStages";

interface SideSwitcherProps {
  className?: string;
  /** compact = icon + short label, used inside headers */
  compact?: boolean;
}

const OPTIONS: { key: AppSide; label: string; short: string; icon: typeof GraduationCap; to: string }[] = [
  { key: "cbt", label: "CBT Practice", short: "CBT", icon: GraduationCap, to: "/dashboard" },
  { key: "services", label: "Services", short: "Services", icon: Briefcase, to: "/dashboard" },
];

/**
 * Only pre-admission students (SS3 / WAEC / JAMB) can switch sides.
 * Campus students have no switcher — Campus is their whole app.
 */
export const SideSwitcher = ({ className, compact }: SideSwitcherProps) => {
  const { side, chooseSide } = useAppSide();
  const navigate = useNavigate();

  if (isCampusStage(readCachedStage())) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border bg-muted/50 p-1",
        className
      )}
      role="tablist"
      aria-label="Switch Edura side"
    >
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const active = side === option.key;
        return (
          <button
            key={option.key}
            role="tab"
            aria-selected={active}
            onClick={() => {
              chooseSide(option.key);
              navigate(option.to);
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              compact ? "px-2.5" : "sm:text-sm",
              active
                ? "bg-background text-foreground shadow-sm border"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{compact ? option.short : option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SideSwitcher;
