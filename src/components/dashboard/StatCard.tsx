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
    <Card className="relative overflow-hidden hover:shadow-2xl transition-all duration-300 group border-0 bg-gradient-to-br from-card to-muted/30 hover-lift">
      {/* Animated background glow */}
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity",
        gradient
      )} />
      
      {/* Subtle top border accent */}
      <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", gradient)} />
      
      <CardContent className="md:p-6 p-3 relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="md:text-sm text-xs text-muted-foreground md:mb-2 mb-1 font-medium uppercase tracking-wide">{label}</p>
            <p className="md:text-4xl text-2xl font-bold md:mb-1 mb-0.5 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
              {value}
            </p>
            {subtext && (
              <p className="md:text-xs text-[10px] text-muted-foreground">{subtext}</p>
            )}
          </div>
          <div className={cn(
            "md:p-3 p-2 rounded-xl bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform",
            gradient
          )}>
            <Icon className="md:h-7 md:w-7 h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
