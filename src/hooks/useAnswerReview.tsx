import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface QuestionReview {
  id: string;
  question_text: string;
  type: string;
  options: any[];
  user_answer: any;
  correct_answer: any;
  is_correct: boolean;
  explanation: string;
  subject: string;
  difficulty_level: number;
  time_spent_seconds: number;
}

export const useAnswerReview = (attemptId: string | null) => {
  const [questions, setQuestions] = useState<QuestionReview[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!attemptId) {
      navigate('/dashboard');
      return;
    }

    const fetchAnswerReview = async () => {
      try {
        setLoading(true);

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        // Get user's internal ID
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', user.id)
          .maybeSingle();

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
        const { data: allAttempts, error: attemptError } = await supabase
          .rpc('get_student_exam_progress');
        
        const attempt = allAttempts?.find(a => 
          a.id === attemptId && a.user_id === userData.id
        );

        if (!attempt) {
          toast({
            title: 'Error',
            description: 'Exam attempt not found or access denied',
            variant: 'destructive'
          });
          navigate('/dashboard');
          return;
        }

        // Only show review for completed attempts
        if (attempt.status !== 'SUBMITTED') {
          toast({
            title: 'Error',
            description: 'Answer review is only available for completed exams',
            variant: 'destructive'
          });
          navigate('/dashboard');
          return;
        }

        // Fetch answers with question details
        const { data: answersData, error: answersError } = await supabase
          .from('attempt_answers')
          .select(`
            id,
            question_id,
            answer,
            is_correct,
            is_flagged,
            time_spent_seconds,
            answered_at
          `)
          .eq('attempt_id', attemptId);

        if (answersError || !answersData) {
          throw answersError || new Error('Failed to load answers');
        }

        // Get question IDs and fetch secure question data via RPC
        const questionIds = answersData.map(a => a.question_id);
        const { data: questionsData, error: questionsError } = await supabase
          .rpc('get_exam_questions_secure', { 
            exam_question_ids: questionIds 
          });

        if (!questionsData) {
          throw new Error('Failed to load question details');
        }

        // Get subjects for the questions
        const subjectIds = [...new Set(questionsData.map(q => q.subject_id))];
        const { data: subjectsData } = await supabase
          .from('subjects')
          .select('id, name')
          .in('id', subjectIds);

        // Combine the data
        const questionDetails: QuestionReview[] = await Promise.all(answersData.map(async (answer) => {
          const question = questionsData?.find(q => q.id === answer.question_id);
          const subject = subjectsData?.find(s => s.id === question?.subject_id);
          
          if (!question) return null;

          try {
            // Fetch full question data for review
            const { data: fullQuestionData } = await supabase
              .from('questions')
              .select('correct_answer, explanation')
              .eq('id', question.id)
              .maybeSingle();

            return {
              id: question.id,
              question_text: question.question_text,
              type: question.type,
              options: Array.isArray(question.options) ? question.options : [],
              user_answer: answer.answer,
              correct_answer: fullQuestionData?.correct_answer || null,
              is_correct: answer.is_correct,
              explanation: fullQuestionData?.explanation || 'No explanation available',
              subject: subject?.name || 'Unknown Subject',
              difficulty_level: question.difficulty_level || 1,
              time_spent_seconds: answer.time_spent_seconds || 0
            };
          } catch (error) {
            return {
              id: question.id,
              question_text: question.question_text,
              type: question.type,
              options: Array.isArray(question.options) ? question.options : [],
              user_answer: answer.answer,
              correct_answer: null,
              is_correct: answer.is_correct,
              explanation: 'Explanation not available',
              subject: subject?.name || 'Unknown Subject',
              difficulty_level: question.difficulty_level || 1,
              time_spent_seconds: answer.time_spent_seconds || 0
            };
          }
        }));

        // Filter out null results
        const validQuestions = questionDetails.filter(q => q !== null) as QuestionReview[];
        setQuestions(validQuestions);
      } catch (error) {
        console.error('Error fetching answer review:', error);
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

    fetchAnswerReview();
  }, [attemptId, navigate, toast]);

  return { questions, loading };
};
