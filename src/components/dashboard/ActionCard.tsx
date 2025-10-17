import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ActionCardProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  gradient: string;
  onClick?: () => void;
  children?: ReactNode;
  className?: string;
}

export const ActionCard = ({
  icon: Icon,
  title,
  subtitle,
  gradient,
  onClick,
  children,
  className
}: ActionCardProps) => {
  const content = (
    <>
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-90",
        gradient
      )} />
      
      {/* Animated overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shine" />
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center gap-2 text-white">
        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-7 w-7" />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-base">{title}</h3>
          {subtitle && (
            <p className="text-xs text-white/80 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
    </>
  );

  if (children) {
    return children;
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl h-36 w-full group cursor-pointer",
        "transform transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95",
        className
      )}
    >
      {content}
    </button>
  );
};
