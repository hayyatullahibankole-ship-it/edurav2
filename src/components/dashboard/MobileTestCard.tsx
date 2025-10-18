import { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileTestCardProps {
  title: string;
  score: number;
  date: string;
  icon: LucideIcon;
  onClick?: () => void;
}

export const MobileTestCard = ({ 
  title, 
  score, 
  date, 
  icon: Icon,
  onClick 
}: MobileTestCardProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'from-success to-success-glow';
    if (score >= 50) return 'from-warning to-warning';
    return 'from-destructive to-destructive';
  };

  return (
    <div
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl p-4 bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-500 ease-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer group animate-fade-in"
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate">{title}</h4>
          <p className="text-xs text-muted-foreground">{date}</p>
        </div>
        
        {/* Score Badge */}
        <div className="flex items-center gap-2">
          <div className={cn(
            "px-3 py-1.5 rounded-full bg-gradient-to-r text-white font-bold text-sm shadow-lg",
            getScoreColor(score)
          )}>
            {score}%
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};
