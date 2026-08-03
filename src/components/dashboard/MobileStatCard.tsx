import { LucideIcon } from 'lucide-react';

interface MobileStatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  gradient?: string;
  delay?: string;
}

export const MobileStatCard = ({ icon: Icon, label, value }: MobileStatCardProps) => {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
    </div>
  );
};
