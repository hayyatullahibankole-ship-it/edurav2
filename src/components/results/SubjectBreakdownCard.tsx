import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';
import { ResultsData } from '@/hooks/useResultsData';

interface SubjectBreakdownCardProps {
  results: ResultsData;
}

export const SubjectBreakdownCard = ({ results }: SubjectBreakdownCardProps) => {
  const subjectBreakdown = results.subject_breakdown || {};
  const subjects = Object.entries(subjectBreakdown);

  if (subjects.length === 0) {
    return null;
  }

  const getGrade = (percentage: number) => {
    if (percentage >= 85) return { grade: 'A1', color: 'text-green-600', bg: 'bg-green-50' };
    if (percentage >= 75) return { grade: 'B2', color: 'text-green-600', bg: 'bg-green-50' };
    if (percentage >= 65) return { grade: 'B3', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (percentage >= 55) return { grade: 'C4', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (percentage >= 50) return { grade: 'C5', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (percentage >= 45) return { grade: 'C6', color: 'text-orange-600', bg: 'bg-orange-50' };
    if (percentage >= 40) return { grade: 'D7', color: 'text-orange-600', bg: 'bg-orange-50' };
    if (percentage >= 35) return { grade: 'E8', color: 'text-red-600', bg: 'bg-red-50' };
    return { grade: 'F9', color: 'text-red-600', bg: 'bg-red-50' };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Subject Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {subjects.map(([subject, data]) => {
          const gradeInfo = getGrade(data.percentage);
          return (
            <div key={subject} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h4 className="font-medium">{subject}</h4>
                  <Badge variant="outline" className={`${gradeInfo.color} ${gradeInfo.bg}`}>
                    {gradeInfo.grade}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {data.correct}/{data.total}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {data.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
              <Progress value={data.percentage} className="h-2" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
