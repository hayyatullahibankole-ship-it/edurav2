import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { BookOpen, Loader2 } from 'lucide-react';
import { useAnswerReview } from '@/hooks/useAnswerReview';
import { ReviewHeader } from '@/components/review/ReviewHeader';
import { ReviewFilters } from '@/components/review/ReviewFilters';
import { QuestionReviewCard } from '@/components/review/QuestionReviewCard';

const AnswerReview = () => {
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get('attempt');
  const { questions, loading } = useAnswerReview(attemptId);
  const [activeTab, setActiveTab] = useState('all');

  const correctAnswers = questions.filter(q => q.is_correct);
  const incorrectAnswers = questions.filter(q => !q.is_correct);

  const getFilteredQuestions = () => {
    switch (activeTab) {
      case 'correct':
        return correctAnswers;
      case 'incorrect':
        return incorrectAnswers;
      default:
        return questions;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading answer review...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <ReviewHeader attemptId={attemptId!} questions={questions} />

        {/* Answer Review Tabs */}
        <ReviewFilters 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          correctCount={correctAnswers.length}
          incorrectCount={incorrectAnswers.length}
        />

        <TabsContent value={activeTab} className="space-y-6 mt-6">
          {getFilteredQuestions().map((question, index) => (
            <QuestionReviewCard 
              key={question.id} 
              question={question} 
              index={index}
            />
          ))}

          {getFilteredQuestions().length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No questions found</h3>
                <p className="text-muted-foreground">
                  {activeTab === 'correct' && 'No correct answers to show'}
                  {activeTab === 'incorrect' && 'Great! No incorrect answers'}
                  {activeTab === 'all' && 'No questions available for review'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </div>
    </div>
  );
};

export default AnswerReview;
