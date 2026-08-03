import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  gradient?: string;
  iconColor?: string;
}

export const StatCard = ({
  icon: Icon,
  label,
  value,
  subtext,
  iconColor = 'text-primary',
}: StatCardProps) => {
  return (
    <div className="w-full rounded-xl border border-border bg-card p-4 md:p-5 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
          <Icon className={cn('h-4 w-4', iconColor)} />
        </div>
      </div>
      <p className="mt-3 break-words text-2xl font-bold md:text-3xl">{value}</p>
      {subtext && <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>}
    </div>
  );
};
