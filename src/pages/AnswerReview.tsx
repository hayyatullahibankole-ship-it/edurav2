import { useSearchParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useCleanAnswerReview } from '@/hooks/useCleanAnswerReview';
import { CleanAnswerReviewCard } from '@/components/CleanAnswerReviewCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { ResultsPaywall } from '@/components/ResultsPaywall';

export default function AnswerReview() {
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get('attempt');
  const { questions, loading } = useCleanAnswerReview(attemptId);
  const [activeTab, setActiveTab] = useState<'all' | 'correct' | 'incorrect'>('all');
  const { hasPremiumAccess, isPremium, loading: subscriptionLoading } = useSubscription();

  const getFilteredQuestions = () => {
    if (activeTab === 'all') return questions;
    if (activeTab === 'correct') return questions.filter(q => q.isCorrect);
    if (activeTab === 'incorrect') return questions.filter(q => !q.isCorrect);
    return questions;
  };

  const correctCount = questions.filter(q => q.isCorrect).length;
  const incorrectCount = questions.filter(q => !q.isCorrect).length;

  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg">Loading answer review...</p>
        </div>
      </div>
    );
  }

  // Paywall: require subscription to access detailed review
  if (!hasPremiumAccess && !isPremium) {
    const total = questions.length || 0;
    const percentage = total ? (correctCount / total) * 100 : 0;
    return (
      <ResultsPaywall
        percentage={percentage}
        totalQuestions={total}
        correctAnswers={correctCount}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Answer Review</h1>
            <p className="text-primary-foreground/80">Review your answers and learn from explanations</p>
          </div>
          <Button asChild variant="secondary">
            <Link to={`/results?attempt=${attemptId}`} aria-label="Back to results">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Results
            </Link>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <span className="text-3xl font-bold">{questions.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Correct Answers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-3xl font-bold text-green-600">{correctCount}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Incorrect Answers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-3xl font-bold text-red-600">{incorrectCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All ({questions.length})
            </TabsTrigger>
            <TabsTrigger value="correct">
              Correct ({correctCount})
            </TabsTrigger>
            <TabsTrigger value="incorrect">
              Incorrect ({incorrectCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6 space-y-6">
            {getFilteredQuestions().length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No questions found in this category</p>
                </CardContent>
              </Card>
            ) : (
              getFilteredQuestions().map((question, index) => (
                <CleanAnswerReviewCard
                  key={question.id}
                  question={question}
                  index={index}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
