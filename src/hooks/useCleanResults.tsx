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

        // Optimized polling - trigger handles computation now
        const pollResults = async (retries = 4, delayMs = 500) => {
          for (let i = 0; i < retries; i++) {
            const { data, error } = await supabase
              .from('results')
              .select('id,attempt_id,raw_score,scaled_score,correct_answers,wrong_answers,unanswered,total_questions,percentage,subject_breakdown,time_taken_minutes,created_at')
              .eq('attempt_id', attemptId)
              .maybeSingle();
            
            if (error) {
              console.warn('Results fetch error:', error);
            }
            
            if (data) return data;
            
            // Only wait if not last retry
            if (i < retries - 1) {
              await new Promise((r) => setTimeout(r, delayMs));
            }
          }
          return null;
        };

        let resultsData = await pollResults();

        // If still no results after polling, trigger manual computation once
        if (!resultsData) {
          console.log('No results found, triggering manual computation...');
          try {
            await supabase.rpc('recompute_results_for_attempt', { attempt_uuid: attemptId });
            // Short re-poll after manual trigger
            resultsData = await pollResults(2, 300);
          } catch (err) {
            console.error('Manual recompute failed:', err);
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
