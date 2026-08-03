import { Badge } from '@/components/ui/badge';
import { LucideIcon, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  gradient?: string;
  badge?: string;
}

export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  href,
  badge,
}: FeatureCardProps) => {
  return (
    <Link to={href} className="group block h-full w-full">
      <div className="flex h-full flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50 md:p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted md:h-11 md:w-11">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          {badge && (
            <Badge variant="secondary" className="text-[10px] font-semibold">
              {badge}
            </Badge>
          )}
        </div>
        <h3 className="mb-1 text-base font-bold md:text-lg">{title}</h3>
        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-auto flex items-center text-sm font-semibold text-primary">
          Explore <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
};
