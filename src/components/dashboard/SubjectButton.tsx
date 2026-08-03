import { LucideIcon } from "lucide-react";

interface SubjectButtonProps {
  icon: LucideIcon;
  title: string;
  gradient?: string;
  onClick: () => void;
}

export const SubjectButton = ({ icon: Icon, title, onClick }: SubjectButtonProps) => {
  return (
    <button onClick={onClick} className="group flex flex-col items-center gap-2">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-card transition-colors group-hover:border-primary/50">
        <Icon className="h-6 w-6 text-primary" strokeWidth={2} />
      </div>
      <span className="text-xs font-semibold text-foreground">{title}</span>
    </button>
  );
};
