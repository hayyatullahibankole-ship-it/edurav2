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
      
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-2 font-medium uppercase tracking-wide">{label}</p>
            <p className="text-4xl font-bold mb-1 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
              {value}
            </p>
            {subtext && (
              <p className="text-xs text-muted-foreground">{subtext}</p>
            )}
          </div>
          <div className={cn(
            "p-3 rounded-xl bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform",
            gradient
          )}>
            <Icon className="h-7 w-7 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
