import { Progress } from '@/components/ui/progress';
import { TrendingUp } from 'lucide-react';

interface MobileSubjectCardProps {
  subject: string;
  progress: number;
}

export const MobileSubjectCard = ({ subject, progress }: MobileSubjectCardProps) => {
  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-success';
    if (progress >= 50) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className="p-4 rounded-2xl bg-card border border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <h4 className="font-semibold text-sm">{subject}</h4>
        </div>
        <span className="text-lg font-bold text-primary">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};
