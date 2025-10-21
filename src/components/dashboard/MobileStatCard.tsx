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
      className="relative overflow-visible rounded-3xl p-5 transition-all duration-500 ease-out hover:scale-105 active:scale-95 group animate-fade-in-up cursor-pointer"
      style={{ 
        animationDelay: delay,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)'
      }}
    >
      {/* Glassmorphic Background */}
      <div className={cn("absolute inset-0 rounded-3xl bg-gradient-to-br opacity-95 group-active:opacity-100 backdrop-blur-xl", gradient)} />
      
      {/* Soft inner glow */}
      <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          {/* Icon container with neumorphic effect */}
          <div 
            className="p-3 rounded-2xl bg-white/25 backdrop-blur-md shadow-lg"
            style={{
              boxShadow: 'inset 0 2px 8px rgba(255, 255, 255, 0.2), 0 4px 16px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Icon className="h-5 w-5 text-white drop-shadow-md" />
          </div>
          <div className="text-3xl font-bold text-white drop-shadow-lg tracking-tight">
            {value}
          </div>
        </div>
        <p className="text-xs font-semibold text-white/95 tracking-wide uppercase">{label}</p>
      </div>
      
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      </div>
    </div>
  );
};
