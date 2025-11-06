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
    <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group border-0 bg-card hover-lift w-full">
      {/* Colored top border accent */}
      <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", gradient)} />
      
      <CardContent className="p-4 md:p-6 relative pt-5">
        <div className="flex flex-col gap-2 md:gap-3">
          {/* Header with icon */}
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide flex-1">{label}</p>
            <div className={cn(
              "p-2 rounded-full bg-gradient-to-br shadow-md flex-shrink-0",
              gradient
            )}>
              <Icon className="h-4 w-4 text-white" />
            </div>
          </div>
          
          {/* Value */}
          <div>
            <p className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1 break-words">
              {value}
            </p>
            {subtext && (
              <p className="text-xs text-muted-foreground">{subtext}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
