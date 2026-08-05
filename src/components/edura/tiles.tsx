import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Compact metric tile used across Home, CBT, Campus and Wallet. */
export const StatTile = ({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  className?: string;
}) => (
  <div className={cn("rounded-2xl border bg-card p-4 sm:p-5", className)}>
    <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
    <p className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight">{value}</p>
    {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
  </div>
);

/** A large tappable workspace / action tile. */
export const ActionTile = ({
  to,
  icon: Icon,
  title,
  description,
  className,
}: {
  to: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}) => (
  <Link
    to={to}
    className={cn(
      "group rounded-2xl border bg-card p-5 transition-colors hover:border-primary/50 flex flex-col",
      className
    )}
  >
    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
      <Icon className="h-5 w-5" />
    </div>
    <p className="mt-3 text-sm font-semibold">{title}</p>
    {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
  </Link>
);

/** A quiet list row for discover-style navigation. Pass `href` for external links. */
export const ListRow = ({
  to,
  href,
  onClick,
  icon: Icon,
  title,
  meta,
}: {
  to?: string;
  href?: string;
  onClick?: () => void;
  icon: LucideIcon;
  title: string;
  meta?: string;
}) => {
  const className =
    "flex w-full items-center gap-3 rounded-xl border bg-card px-3.5 py-3 text-left transition-colors hover:bg-muted/50";

  const inner = (
    <>
      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{title}</p>
        {meta && <p className="text-[11px] text-muted-foreground truncate">{meta}</p>}
      </div>
      {href ? (
        <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
      ) : (
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      )}
    </>
  );

  if (href) {
    return (
      <button type="button" className={className} onClick={() => openExternal(href)}>
        {inner}
      </button>
    );
  }

  if (!to) {
    return (
      <button type="button" className={className} onClick={onClick}>
        {inner}
      </button>
    );
  }

  return (
    <Link to={to} className={className} onClick={onClick}>
      {inner}
    </Link>
  );
};


/** Section wrapper with a consistent heading. */
export const Panel = ({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <section className={cn("rounded-2xl border bg-card p-5", className)}>
    {(title || action) && (
      <div className="mb-4 flex items-center justify-between gap-3">
        {title && <h2 className="text-base font-semibold">{title}</h2>}
        {action}
      </div>
    )}
    {children}
  </section>
);

export const EmptyState = ({ children }: { children: ReactNode }) => (
  <p className="py-6 text-center text-sm text-muted-foreground">{children}</p>
);
