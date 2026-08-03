import { LucideIcon, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileTestCardProps {
  title: string;
  score: number;
  date: string;
  icon: LucideIcon;
  onClick?: () => void;
}

export const MobileTestCard = ({ title, score, date, icon: Icon, onClick }: MobileTestCardProps) => {
  const scoreClass =
    score >= 75
      ? 'text-success border-success/30 bg-success/10'
      : score >= 50
      ? 'text-warning border-warning/30 bg-warning/10'
      : 'text-destructive border-destructive/30 bg-destructive/10';

  return (
    <div
      onClick={onClick}
      className="group flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
    >
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
        <Icon className="h-5 w-5 text-primary" />
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-bold">{title}</h4>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>

      <div className="flex items-center gap-2">
        <span className={cn('rounded-lg border px-2.5 py-1 text-sm font-bold', scoreClass)}>
          {score}%
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
};
