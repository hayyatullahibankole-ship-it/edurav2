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
    if (score >= 75) return 'from-success via-success-glow to-success';
    if (score >= 50) return 'from-warning via-warning to-warning';
    return 'from-destructive via-destructive to-destructive';
  };

  return (
    <div
      onClick={onClick}
      className="relative overflow-hidden rounded-3xl p-5 bg-card/80 backdrop-blur-sm border-0 hover:shadow-xl transition-all duration-500 ease-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer group animate-fade-in"
      style={{
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.03)'
      }}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 flex items-center gap-4">
        {/* Icon with neumorphic effect */}
        <div 
          className="p-4 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 group-hover:from-primary/25 group-hover:to-primary/10 transition-all duration-500 shadow-lg"
          style={{
            boxShadow: 'inset 0 2px 8px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)'
          }}
        >
          <Icon className="h-6 w-6 text-primary drop-shadow-sm" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-base truncate text-foreground/90 mb-1">{title}</h4>
          <p className="text-xs text-muted-foreground font-medium">{date}</p>
        </div>
        
        {/* Score Badge with enhanced style */}
        <div className="flex items-center gap-3">
          <div 
            className={cn(
              "relative px-4 py-2 rounded-2xl bg-gradient-to-r text-white font-bold text-base shadow-xl overflow-hidden",
              getScoreColor(score)
            )}
            style={{
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.2)'
            }}
          >
            <span className="relative z-10">{score}%</span>
            {/* Inner shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all duration-300" />
        </div>
      </div>
    </div>
  );
};
