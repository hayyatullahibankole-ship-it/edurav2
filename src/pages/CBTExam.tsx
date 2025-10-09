import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCBTExam } from '@/hooks/useCBTExam';
import { CleanCBTInterface } from '@/components/CleanCBTInterface';
import { Loader2 } from 'lucide-react';

const CBTExam = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const attemptId = searchParams.get('attempt');

  const {
    questions,
    answers,
    loading,
    submitting,
    selectAnswer,
    submitExam,
    examDuration
  } = useCBTExam(attemptId);

  if (!attemptId) {
    navigate('/dashboard');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">No Questions Available</h2>
          <p className="text-muted-foreground mb-6">
            There are no questions available for this exam. Please contact support or try again.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <CleanCBTInterface
      questions={questions}
      answers={answers}
      onAnswerSelect={selectAnswer}
      onSubmit={submitExam}
      duration={examDuration}
      examTitle="CBT Practice Exam"
    />
  );
};

export default CBTExam;
