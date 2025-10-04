import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CleanQuestionReview {
  id: string;
  questionText: string;
  options: string[];
  userAnswerIndex: number | null;
  correctAnswerIndex: number;
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

        // Fetch answers with stored correctness
        const { data: answersData } = await supabase
          .from('attempt_answers')
          .select('question_id, answer, is_correct, time_spent_seconds')
          .eq('attempt_id', attemptId);

        if (!answersData) {
          throw new Error('Failed to load answers');
        }

        // Get question IDs and fetch details
        const questionIds = answersData.map(a => a.question_id);
        
        // Fetch questions with correct answers (admin access needed)
        const { data: questionsData } = await supabase
          .from('questions')
          .select('id, question_text, options, correct_answer, explanation, subject_id')
          .in('id', questionIds);

        if (!questionsData) {
          throw new Error('Failed to load question details');
        }

        // Get subject names
        const subjectIds = [...new Set(questionsData.map(q => q.subject_id))];
        const { data: subjectsData } = await supabase
          .from('subjects')
          .select('id, name')
          .in('id', subjectIds);

        // Combine data into clean format
        const reviewQuestions: CleanQuestionReview[] = answersData.map(answer => {
          const question = questionsData.find(q => q.id === answer.question_id);
          const subject = subjectsData?.find(s => s.id === question?.subject_id);

          if (!question) return null;

          // Parse correct answer as integer
          const correctAnswerIndex = typeof question.correct_answer === 'number'
            ? question.correct_answer
            : parseInt(String(question.correct_answer));

          // Parse user answer as integer
          const userAnswerIndex = answer.answer !== null && answer.answer !== undefined
            ? (typeof answer.answer === 'number' ? answer.answer : parseInt(String(answer.answer)))
            : null;

          return {
            id: question.id,
            questionText: question.question_text,
            options: Array.isArray(question.options) ? question.options : [],
            userAnswerIndex,
            correctAnswerIndex: isNaN(correctAnswerIndex) ? 0 : correctAnswerIndex,
            isCorrect: answer.is_correct, // Use stored value, don't recompute
            explanation: question.explanation || 'No explanation available',
            subject: subject?.name || 'Unknown',
            timeSpentSeconds: answer.time_spent_seconds || 0
          };
        }).filter(q => q !== null) as CleanQuestionReview[];

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
