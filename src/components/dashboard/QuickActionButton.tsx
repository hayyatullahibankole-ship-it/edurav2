import { LucideIcon } from 'lucide-react';

interface QuickActionButtonProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  variant?: 'default' | 'outline';
  gradient?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const QuickActionButton = ({
  icon: Icon,
  title,
  subtitle,
  onClick,
  children,
}: QuickActionButtonProps) => {
  const content = (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center transition-colors hover:border-primary/50 md:p-5"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted md:h-12 md:w-12">
        <Icon className="h-5 w-5 text-primary md:h-6 md:w-6" />
      </div>
      <div>
        <div className="text-sm font-bold text-foreground md:text-base">{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
      </div>
    </button>
  );

  return children ? <div className="cursor-pointer">{children}</div> : content;
};
