import { Card, CardContent } from '@/components/ui/card';
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
  gradient = "from-primary to-secondary",
  iconColor = "text-primary"
}: StatCardProps) => {
  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group border border-border/50 bg-card/50 backdrop-blur-sm hover:-translate-y-1">
      {/* Compact top accent bar */}
      <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r", gradient)} />
      
      <CardContent className="p-4 relative">
        <div className="flex items-center justify-between gap-3">
          {/* Icon - compact size */}
          <div className={cn(
            "p-2.5 rounded-lg bg-gradient-to-br shadow-md group-hover:scale-105 transition-transform shrink-0",
            gradient
          )}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          
          {/* Content - compact spacing */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-2xl font-bold bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text truncate">
              {value}
            </p>
            {subtext && (
              <p className="text-[10px] text-muted-foreground/80 truncate">{subtext}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
