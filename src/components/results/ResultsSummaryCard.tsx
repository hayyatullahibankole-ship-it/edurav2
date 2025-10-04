import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Clock, TrendingUp } from 'lucide-react';
import { ResultsData } from '@/hooks/useResultsData';

interface ResultsSummaryCardProps {
  results: ResultsData;
}

export const ResultsSummaryCard = ({ results }: ResultsSummaryCardProps) => {
  const examType = results.attempts.proctoring_data.exam_type.toUpperCase();
  const isJamb = examType === 'JAMB';
  const displayScore = isJamb && results.scaled_score ? results.scaled_score : results.percentage;
  const scoreLabel = isJamb ? 'Score' : 'Percentage';
  const maxScore = isJamb ? 400 : 100;

  // Determine performance level
  const getPerformanceLevel = () => {
    const percent = results.percentage;
    if (percent >= 80) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
    if (percent >= 70) return { label: 'Very Good', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (percent >= 60) return { label: 'Good', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (percent >= 50) return { label: 'Fair', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { label: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const performance = getPerformanceLevel();

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Test Results</CardTitle>
          <Badge variant="outline" className="text-lg">
            {examType}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Score Display */}
        <div className={`text-center p-6 rounded-lg ${performance.bg}`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className={`w-8 h-8 ${performance.color}`} />
            <p className="text-sm font-medium text-muted-foreground">{scoreLabel}</p>
          </div>
          <p className={`text-6xl font-bold ${performance.color}`}>
            {displayScore}
            {!isJamb && '%'}
          </p>
          {isJamb && (
            <p className="text-sm text-muted-foreground mt-1">out of {maxScore}</p>
          )}
          <Badge className={`mt-4 ${performance.color} ${performance.bg}`}>
            {performance.label}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span className="font-medium">{results.percentage.toFixed(1)}%</span>
          </div>
          <Progress value={results.percentage} className="h-3" />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <Target className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Correct</p>
              <p className="text-xl font-bold">{results.correct_answers}/{results.total_questions}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Time Taken</p>
              <p className="text-xl font-bold">{results.time_taken_minutes}m</p>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{results.correct_answers}</p>
            <p className="text-xs text-muted-foreground">Correct</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{results.wrong_answers}</p>
            <p className="text-xs text-muted-foreground">Wrong</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600">{results.unanswered}</p>
            <p className="text-xs text-muted-foreground">Unanswered</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
