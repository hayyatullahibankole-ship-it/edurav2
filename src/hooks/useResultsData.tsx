import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ResultsData {
  id: string;
  attempt_id: string;
  raw_score: number;
  scaled_score: number | null;
  percentage: number;
  subject_breakdown: Record<string, { total: number; correct: number; percentage: number }>;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  unanswered: number;
  time_taken_minutes: number;
  percentile_rank: number | null;
  created_at: string;
  attempts: {
    id: string;
    exam_id: string | null;
    user_id: string;
    started_at: string;
    submitted_at: string | null;
    proctoring_data: {
      title: string;
      exam_type: string;
      description: string;
      duration_minutes: number;
      question_count_per_subject: number;
    };
  };
}

export const useResultsData = (attemptId: string | null) => {
  const [results, setResults] = useState<ResultsData | null>(null);
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

        const { data, error } = await supabase
          .from('results')
          .select(`
            *,
            attempts!inner(
              id,
              exam_id,
              user_id,
              started_at,
              submitted_at,
              proctoring_data
            )
          `)
          .eq('attempt_id', attemptId)
          .single();

        if (error) throw error;

        if (!data) {
          throw new Error('Results not found');
        }

        // Type cast with proper handling of JSON fields
        const resultsData: ResultsData = {
          id: data.id,
          attempt_id: data.attempt_id,
          raw_score: data.raw_score,
          scaled_score: data.scaled_score,
          percentage: data.percentage,
          subject_breakdown: (data.subject_breakdown as any) || {},
          total_questions: data.total_questions,
          correct_answers: data.correct_answers,
          wrong_answers: data.wrong_answers,
          unanswered: data.unanswered,
          time_taken_minutes: data.time_taken_minutes,
          percentile_rank: data.percentile_rank,
          created_at: data.created_at,
          attempts: {
            id: data.attempts.id,
            exam_id: data.attempts.exam_id,
            user_id: data.attempts.user_id,
            started_at: data.attempts.started_at,
            submitted_at: data.attempts.submitted_at,
            proctoring_data: (data.attempts.proctoring_data as any) || {}
          }
        };

        setResults(resultsData);
      } catch (error) {
        console.error('Error fetching results:', error);
        toast({
          title: 'Error',
          description: 'Failed to load test results',
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
