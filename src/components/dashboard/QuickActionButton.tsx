import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickActionButtonProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  variant?: "default" | "outline";
  gradient?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const QuickActionButton = ({ 
  icon: Icon, 
  title, 
  subtitle,
  variant = "default",
  gradient = "from-primary to-secondary",
  onClick,
  children
}: QuickActionButtonProps) => {
  const content = (
    <Button 
      variant={variant} 
      className={`h-auto p-6 flex-col gap-3 w-full group transition-all duration-300 ${
        variant === "default" 
          ? `bg-gradient-to-br ${gradient} hover:shadow-glow` 
          : "hover:border-primary/50"
      }`}
      onClick={onClick}
    >
      <div className={`w-12 h-12 rounded-xl ${
        variant === "default" 
          ? "bg-white/20" 
          : `bg-gradient-to-br ${gradient} bg-opacity-10`
      } flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`h-6 w-6 ${variant === "default" ? "text-white" : "text-primary"}`} />
      </div>
      <div className="text-center">
        <div className={`font-bold text-base ${variant === "default" ? "text-white" : "text-foreground"}`}>
          {title}
        </div>
        {subtitle && (
          <div className={`text-xs ${variant === "default" ? "text-white/80" : "text-muted-foreground"}`}>
            {subtitle}
          </div>
        )}
      </div>
    </Button>
  );

  return children ? <div onClick={onClick}>{children || content}</div> : content;
};
