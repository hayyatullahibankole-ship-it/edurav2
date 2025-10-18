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
    <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group border-0 bg-card hover-lift">
      {/* Colored top border accent */}
      <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", gradient)} />
      
      <CardContent className="md:p-6 p-4 relative pt-5">
        <div className="flex flex-col gap-3">
          {/* Header with icon */}
          <div className="flex items-start justify-between">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
            <div className={cn(
              "p-2 rounded-full bg-gradient-to-br shadow-md",
              gradient
            )}>
              <Icon className="h-4 w-4 text-white" />
            </div>
          </div>
          
          {/* Value */}
          <div>
            <p className="text-3xl md:text-4xl font-bold mb-1">
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
