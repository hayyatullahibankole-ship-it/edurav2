import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Same shuffle utilities as in useCBTExam for consistency
const strHash = (s: string) => {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const mulberry32 = (a: number) => {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffledIndices = (length: number, seed: number) => {
  const indices = Array.from({ length }, (_, i) => i);
  const rand = mulberry32(seed);
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
};

export interface CleanQuestionReview {
  id: string;
  questionText: string;
  options: string[]; // Shuffled same as during exam
  userAnswerIndex: number | null; // Display index
  correctAnswerIndex: number; // Display index
  isCorrect: boolean;
  explanation: string;
  subject: string;
  timeSpentSeconds: number;
}

export const useCleanAnswerReview = (attemptId: string | null) => {
  const [questions, setQuestions] = useState<CleanQuestionReview[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!attemptId) {
      navigate('/dashboard');
      return;
    }

    const fetchReview = async () => {
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
          toast({
            title: 'Error',
            description: 'User not found',
            variant: 'destructive'
          });
          navigate('/dashboard');
          return;
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
            description: 'Attempt not found or access denied',
            variant: 'destructive'
          });
          navigate('/dashboard');
          return;
        }

        if (attemptData.status !== 'SUBMITTED') {
          toast({
            title: 'Error',
            description: 'Answer review is only available for submitted exams',
            variant: 'destructive'
          });
          navigate('/dashboard');
          return;
        }

        // Use secure review RPC that returns everything we need
        const { data: reviewData, error: reviewError } = await supabase
          .rpc('get_review_questions_for_attempt', { 
            attempt_uuid: attemptId 
          });

        if (reviewError) {
          throw reviewError;
        }

        if (!reviewData || reviewData.length === 0) {
          throw new Error('No review data available');
        }

        // Apply same deterministic shuffle as during exam
        const attemptSeed = strHash(attemptId);
        
        const reviewQuestions: CleanQuestionReview[] = reviewData.map(item => {
          const originalOptions = Array.isArray(item.options) 
            ? item.options.map((opt: any) => String(opt))
            : [];
          
          // Generate same shuffle as during exam
          const questionSeed = attemptSeed ^ strHash(item.id);
          const shuffleMap = shuffledIndices(originalOptions.length, questionSeed);
          
          // Shuffle options
          const shuffledOptions = shuffleMap.map(origIdx => originalOptions[origIdx]);
          
          // Map indices: stored original indices -> display indices
          const userDisplayIndex = item.user_answer_index !== null
            ? shuffleMap.indexOf(item.user_answer_index)
            : null;
          
          const correctDisplayIndex = shuffleMap.indexOf(item.correct_answer_index);

          return {
            id: item.id,
            questionText: item.question_text,
            options: shuffledOptions,
            userAnswerIndex: userDisplayIndex,
            correctAnswerIndex: correctDisplayIndex !== -1 ? correctDisplayIndex : 0,
            isCorrect: item.is_correct,
            explanation: item.explanation || 'No explanation available',
            subject: item.subject_name || 'Unknown',
            timeSpentSeconds: item.time_spent_seconds || 0
          };
        });

        setQuestions(reviewQuestions);

      } catch (error) {
        console.error('Error fetching review:', error);
        toast({
          title: 'Error',
          description: 'Failed to load answer review',
          variant: 'destructive'
        });
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [attemptId, navigate, toast]);

  return { questions, loading };
};
