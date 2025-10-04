import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Target, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QuestionReview } from '@/hooks/useAnswerReview';

interface ReviewHeaderProps {
  attemptId: string;
  questions: QuestionReview[];
}

export const ReviewHeader = ({ attemptId, questions }: ReviewHeaderProps) => {
  const correctAnswers = questions.filter(q => q.is_correct);
  const incorrectAnswers = questions.filter(q => !q.is_correct);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Answer Review</h1>
          <p className="text-muted-foreground mt-2">
            Review your answers and learn from explanations
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to={`/results?attempt=${attemptId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Results
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/dashboard">
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questions.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Correct Answers</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{correctAnswers.length}</div>
            <p className="text-xs text-muted-foreground">
              {questions.length > 0 ? Math.round((correctAnswers.length / questions.length) * 100) : 0}% accuracy
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incorrect Answers</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{incorrectAnswers.length}</div>
            <p className="text-xs text-muted-foreground">
              Areas for improvement
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
