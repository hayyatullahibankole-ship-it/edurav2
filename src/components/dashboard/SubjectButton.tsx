import { LucideIcon } from "lucide-react";

interface SubjectButtonProps {
  icon: LucideIcon;
  title: string;
  gradient: string;
  onClick: () => void;
}

export const SubjectButton = ({ 
  icon: Icon, 
  title,
  gradient,
  onClick
}: SubjectButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 group"
    >
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-active:scale-95`}>
        <Icon className="h-7 w-7 text-white" strokeWidth={2.5} />
      </div>
      <span className="text-xs font-semibold text-foreground">{title}</span>
    </button>
  );
};
