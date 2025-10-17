import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileStatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  gradient: string;
}

export const MobileStatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  trend,
  gradient 
}: MobileStatCardProps) => {
  return (
    <div className="relative group">
      {/* Background glow effect */}
      <div className={cn(
        "absolute -inset-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 rounded-2xl blur transition duration-300",
        gradient
      )} />
      
      {/* Card content */}
      <div className="relative bg-card border border-border rounded-2xl p-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center justify-between mb-3">
          <div className={cn(
            "p-2.5 rounded-xl bg-gradient-to-br",
            gradient
          )}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          {trend && (
            <span className={cn(
              "text-xs font-semibold px-2 py-1 rounded-full",
              trend.isPositive 
                ? "bg-success/10 text-success" 
                : "bg-destructive/10 text-destructive"
            )}>
              {trend.value}
            </span>
          )}
        </div>
        
        <div>
          <div className="text-2xl font-bold text-foreground mb-1">
            {value}
          </div>
          <div className="text-xs text-muted-foreground font-medium">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
};
