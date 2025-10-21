import { Progress } from '@/components/ui/progress';
import { TrendingUp } from 'lucide-react';

interface MobileSubjectCardProps {
  subject: string;
  progress: number;
}

export const MobileSubjectCard = ({ subject, progress }: MobileSubjectCardProps) => {
  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'from-success/20 to-success/5';
    if (progress >= 50) return 'from-warning/20 to-warning/5';
    return 'from-destructive/20 to-destructive/5';
  };

  const getProgressBarColor = (progress: number) => {
    if (progress >= 75) return 'bg-gradient-to-r from-success to-success-glow';
    if (progress >= 50) return 'bg-gradient-to-r from-warning to-warning';
    return 'bg-gradient-to-r from-destructive to-destructive';
  };

  return (
    <div 
      className="relative p-5 rounded-3xl bg-gradient-to-br border-0 hover:shadow-xl transition-all duration-500 ease-out hover:scale-[1.02] animate-fade-in overflow-hidden group cursor-pointer"
      style={{
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.03)'
      }}
    >
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getProgressColor(progress)} opacity-80`} />
      
      {/* Soft glow effect */}
      <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Neumorphic icon container */}
            <div 
              className="p-3 rounded-2xl bg-white/60 backdrop-blur-sm shadow-lg"
              style={{
                boxShadow: 'inset 0 2px 8px rgba(255, 255, 255, 0.5), 0 4px 12px rgba(0, 0, 0, 0.08)'
              }}
            >
              <TrendingUp className="h-5 w-5 text-primary drop-shadow-md" />
            </div>
            <h4 className="font-bold text-sm text-foreground/90">{subject}</h4>
          </div>
          <div 
            className="px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-sm shadow-md"
            style={{
              boxShadow: 'inset 0 1px 4px rgba(255, 255, 255, 0.6), 0 2px 8px rgba(0, 0, 0, 0.06)'
            }}
          >
            <span className="text-base font-bold text-primary">{progress}%</span>
          </div>
        </div>
        
        {/* Modern progress bar */}
        <div className="relative h-2.5 bg-white/40 rounded-full overflow-hidden backdrop-blur-sm shadow-inner">
          <div 
            className={`h-full ${getProgressBarColor(progress)} rounded-full transition-all duration-1000 ease-out shadow-lg relative overflow-hidden`}
            style={{ width: `${progress}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          </div>
        </div>
      </div>
    </div>
  );
};
