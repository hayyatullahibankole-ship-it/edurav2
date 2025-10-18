import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileStatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  gradient: string;
  delay?: string;
}

export const MobileStatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  gradient,
  delay = '0s'
}: MobileStatCardProps) => {
  return (
    <div 
      className="relative overflow-hidden rounded-2xl p-4 transition-all duration-300 active:scale-95 group"
      style={{ animationDelay: delay }}
    >
      {/* Gradient Background */}
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90 group-active:opacity-100", gradient)} />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div className="text-2xl font-bold text-white drop-shadow-lg">
            {value}
          </div>
        </div>
        <p className="text-xs font-medium text-white/90">{label}</p>
      </div>
      
      {/* Shine effect */}
      <div className="absolute inset-0 opacity-0 group-active:opacity-20 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent" />
      </div>
    </div>
  );
};
