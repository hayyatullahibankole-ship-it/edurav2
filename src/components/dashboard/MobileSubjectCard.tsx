import { TrendingUp } from 'lucide-react';

interface MobileSubjectCardProps {
  subject: string;
  progress: number;
}

export const MobileSubjectCard = ({ subject, progress }: MobileSubjectCardProps) => {
  const barColor =
    progress >= 75 ? 'bg-success' : progress >= 50 ? 'bg-warning' : 'bg-destructive';

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <h4 className="truncate text-sm font-bold">{subject}</h4>
        </div>
        <span className="text-sm font-bold text-primary">{progress}%</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
