import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernQuickActionProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  gradient: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const ModernQuickAction = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  gradient,
  onClick,
  children 
}: ModernQuickActionProps) => {
  const content = (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl p-5 transition-all duration-300 active:scale-[0.97] cursor-pointer group",
        "bg-gradient-to-br shadow-lg hover:shadow-xl"
      )}
      onClick={onClick}
    >
      {/* Gradient background */}
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90 group-active:opacity-100", gradient)} />
      
      {/* Animated shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-white/90 mb-1">{subtitle}</p>
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        
        {/* Icon */}
        <div className="relative">
          {/* Icon glow */}
          <div className="absolute inset-0 bg-white/20 rounded-full blur-xl" />
          <div className="relative w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
            <Icon className="h-7 w-7 text-white drop-shadow-lg" />
          </div>
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30" />
    </div>
  );

  // If children provided (for modal trigger), wrap content
  return children ? <div className="cursor-pointer">{children}</div> : content;
};
