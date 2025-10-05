import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CleanResultsData {
  id: string;
  attemptId: string;
  rawScore: number;
  scaledScore: number | null;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  totalQuestions: number;
  percentage: number;
  timeTakenMinutes: number;
  subjectBreakdown: Record<string, {
    total: number;
    correct: number;
    percentage: number;
  }>;
  createdAt: string;
}

export const useCleanResults = (attemptId: string | null) => {
  const [results, setResults] = useState<CleanResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!attemptId) {
      navigate('/dashboard');
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        // Get user internal ID
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();

        if (!userData) {
          throw new Error('User not found');
        }

        // Verify attempt ownership
        const { data: attemptData } = await supabase
          .from('attempts')
          .select('user_id, status')
          .eq('id', attemptId)
          .single();

        if (!attemptData || attemptData.user_id !== userData.id) {
          toast({
            title: 'Error',
            description: 'Results not found or access denied',
            variant: 'destructive'
          });
          navigate('/dashboard');
          return;
        }

        if (attemptData.status !== 'SUBMITTED') {
          toast({
            title: 'Processing',
            description: 'Results will be available after you submit the exam',
          });
          setLoading(false);
          return;
        }

        // Fetch results with extended polling to avoid race conditions
        const pollResults = async (retries = 20, delayMs = 1000) => {
          for (let i = 0; i < retries; i++) {
            const { data, error } = await supabase
              .from('results')
              .select('*')
              .eq('attempt_id', attemptId)
              .maybeSingle();
            if (error) {
              console.warn('Results fetch attempt error:', error);
            }
            if (data) return data;
            await new Promise((r) => setTimeout(r, delayMs));
          }
          return null;
        };

        let resultsData = await pollResults();

        // Fallback: compute results from secure review RPC if still missing
        if (!resultsData) {
          const { data: reviewData, error: reviewError } = await supabase
            .rpc('get_review_questions_for_attempt', { attempt_uuid: attemptId });
          if (!reviewError && Array.isArray(reviewData) && reviewData.length > 0) {
            const total = reviewData.length;
            const correct = reviewData.filter((q: any) => q.is_correct).length;
            const answered = reviewData.filter((q: any) => q.user_answer_index !== null).length;
            const wrong = Math.max(answered - correct, 0);
            const unanswered = Math.max(total - answered, 0);
            const percentage = total > 0 ? (correct / total) * 100 : 0;

            const subjectBreakdown: any = {};
            reviewData.forEach((q: any) => {
              const subj = q.subject_name || 'Unknown';
              subjectBreakdown[subj] = subjectBreakdown[subj] || { total: 0, correct: 0, percentage: 0 };
              subjectBreakdown[subj].total += 1;
              if (q.is_correct) subjectBreakdown[subj].correct += 1;
            });
            Object.keys(subjectBreakdown).forEach((k) => {
              const s = subjectBreakdown[k];
              s.percentage = s.total > 0 ? (s.correct / s.total) * 100 : 0;
            });

            resultsData = {
              id: 'fallback',
              attempt_id: attemptId,
              raw_score: correct,
              scaled_score: total > 0 ? Math.round((correct / total) * 400) : 0,
              correct_answers: correct,
              wrong_answers: wrong,
              unanswered,
              total_questions: total,
              percentage,
              subject_breakdown: subjectBreakdown,
              time_taken_minutes: 0,
              created_at: new Date().toISOString(),
            } as any;
          }
        }

        // Detect mismatch between saved results and answer review; auto-recompute once
        if (resultsData) {
          const { data: reviewCheck } = await supabase.rpc('get_review_questions_for_attempt', { attempt_uuid: attemptId });
          if (Array.isArray(reviewCheck)) {
            const total = reviewCheck.length;
            const correct = reviewCheck.filter((q: any) => q.is_correct).length;
            if (total > 0 && correct > 0 && (resultsData.correct_answers === 0 || resultsData.percentage === 0)) {
              await supabase.rpc('recompute_results_for_attempt', { attempt_uuid: attemptId });
              // quick re-poll after recompute
              const recomputed = await pollResults(5, 500);
              if (recomputed) resultsData = recomputed;
            }
          }
        }

        if (!resultsData) {
          toast({
            title: 'Results not ready',
            description: 'We are still processing your results. Please try again in a moment.',
          });
          setResults(null);
          setLoading(false);
          return;
        }

        // Transform to clean format
        const cleanResults: CleanResultsData = {
          id: resultsData.id,
          attemptId: resultsData.attempt_id,
          rawScore: resultsData.raw_score,
          scaledScore: resultsData.scaled_score,
          correctAnswers: resultsData.correct_answers,
          wrongAnswers: resultsData.wrong_answers,
          unanswered: resultsData.unanswered,
          totalQuestions: resultsData.total_questions,
          percentage: resultsData.percentage,
          timeTakenMinutes: resultsData.time_taken_minutes || 0,
          subjectBreakdown: resultsData.subject_breakdown as any || {},
          createdAt: resultsData.created_at
        };

        setResults(cleanResults);

      } catch (error) {
        console.error('Error fetching results:', error);
        toast({
          title: 'Error',
          description: 'Failed to load results',
          variant: 'destructive'
        });
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [attemptId, navigate, toast]);

  return { results, loading };
};
