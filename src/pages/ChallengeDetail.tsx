import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { CleanCBTInterface } from '@/components/CleanCBTInterface';
import { useCBTExam } from '@/hooks/useCBTExam';

export default function ChallengeDetail() {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [examTitle, setExamTitle] = useState('Challenge');
  const [examDescription, setExamDescription] = useState('');
  const [loading, setLoading] = useState(true);

  const { questions, answers, selectAnswer, submitExam, examDuration } = useCBTExam(attemptId || '');

  useEffect(() => {
    if (!challengeId || !user) return;

    const fetchChallengeAndCreateAttempt = async () => {
      try {
        // Fetch challenge details
        const { data: challengeData, error: challengeError } = await supabase
          .from('challenges')
          .select('*')
          .eq('id', challengeId)
          .single();

        if (challengeError) throw challengeError;
        if (!challengeData) {
          toast.error('Challenge not found');
          navigate('/challenge-arena');
          return;
        }

        setExamTitle(challengeData.title);
        setExamDescription(challengeData.description);

        // Create an attempt for this challenge
        const { data: attemptData, error: attemptError } = await supabase
          .from('attempts')
          .insert([{
            user_id: user.id,
            exam_type: 'challenge',
            duration_seconds: challengeData.duration_minutes * 60,
            status: 'IN_PROGRESS'
          }])
          .select()
          .single();

        if (attemptError) throw attemptError;
        setAttemptId(attemptData.id);

      } catch (error) {
        console.error('Error setting up challenge:', error);
        toast.error('Failed to start challenge');
        navigate('/challenge-arena');
      } finally {
        setLoading(false);
      }
    };

    fetchChallengeAndCreateAttempt();
  }, [challengeId, user, navigate]);

  if (loading || !attemptId || questions.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showNavbar={false}>
      <CleanCBTInterface
        questions={questions}
        answers={answers}
        onAnswerSelect={selectAnswer}
        onSubmit={submitExam}
        duration={examDuration}
        examTitle={examTitle}
      />
    </Layout>
  );
}
