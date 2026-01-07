import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { useCBTExam } from '@/hooks/useCBTExam';
import { CleanCBTInterface } from '@/components/CleanCBTInterface';
import { Loader2 } from 'lucide-react';
import { usePWAFeatureCheck } from '@/components/PWAFeatureGuard';
import { useEffect } from 'react';

const CBTExam = () => {
  const [searchParams] = useSearchParams();
  const { attemptId: pathAttemptId } = useParams();
  const navigate = useNavigate();
  
  // PWA check for full CBT exams
  const { checkFeatureAccess, InstallModal } = usePWAFeatureCheck();
  
  // Support both query param (?attempt=...) and path param (/exam/:attemptId)
  const attemptId = pathAttemptId || searchParams.get('attempt');

  const {
    questions,
    answers,
    loading,
    submitting,
    selectAnswer,
    submitExam,
    examDuration
  } = useCBTExam(attemptId);

  // Check PWA access when attempting a full CBT exam
  useEffect(() => {
    if (attemptId) {
      const hasAccess = checkFeatureAccess(
        'full-cbt-exam',
        'Full CBT Exams',
        () => navigate('/demo-test') // Fallback to demo
      );
      
      if (!hasAccess) {
        // Modal will be shown, don't proceed
        return;
      }
    }
  }, [attemptId]);

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
    <>
      <InstallModal />
      <CleanCBTInterface
        questions={questions}
        answers={answers}
        onAnswerSelect={selectAnswer}
        onSubmit={submitExam}
        duration={examDuration}
        examTitle="CBT Practice Exam"
        submitting={submitting}
      />
    </>
  );
};

export default CBTExam;
