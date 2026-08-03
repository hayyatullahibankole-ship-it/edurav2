import { LucideIcon } from 'lucide-react';

interface ModernQuickActionProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  gradient?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const ModernQuickAction = ({
  icon: Icon,
  title,
  subtitle,
  onClick,
  children,
}: ModernQuickActionProps) => {
  const content = (
    <div
      className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50 active:scale-[0.99]"
      onClick={onClick}
    >
      <div className="flex-1">
        <p className="mb-0.5 text-xs font-medium text-muted-foreground">{subtitle}</p>
        <h3 className="text-base font-bold">{title}</h3>
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-muted">
        <Icon className="h-5 w-5 text-primary" />
      </div>
    </div>
  );

  return children ? <div className="cursor-pointer">{children}</div> : content;
};
