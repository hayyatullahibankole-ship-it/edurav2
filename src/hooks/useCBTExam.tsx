import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export interface CBTQuestion {
  id: string;
  questionText: string;
  options: string[];
  subject: string;
  displayIndex: number;
}

export interface CBTAnswers {
  [questionId: string]: number; // Store as 0-based index
}

export const useCBTExam = (attemptId: string | null) => {
  const [questions, setQuestions] = useState<CBTQuestion[]>([]);
  const [answers, setAnswers] = useState<CBTAnswers>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch questions
  useEffect(() => {
    if (!attemptId) {
      navigate('/dashboard');
      return;
    }

    const fetchQuestions = async () => {
      try {
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        // Get attempt details
        const { data: attemptData } = await supabase
          .from('attempts')
          .select('*, exams(*)')
          .eq('id', attemptId)
          .single();

        if (!attemptData) {
          throw new Error('Attempt not found');
        }

        // Fetch questions based on exam type
        let questionIds: string[] = [];

        if (attemptData.exam_id) {
          // Standard exam
          const { data: examQuestions } = await supabase
            .from('exam_subjects')
            .select('subject_id, question_count')
            .eq('exam_id', attemptData.exam_id);

          // Get random questions for each subject
          // (Simplified - you may want to use an RPC for this)
          const allQuestionIds: string[] = [];
          for (const es of examQuestions || []) {
            const { data: subjectQs } = await supabase
              .from('questions')
              .select('id')
              .eq('subject_id', es.subject_id)
              .eq('is_active', true)
              .limit(es.question_count);
            
            allQuestionIds.push(...(subjectQs?.map(q => q.id) || []));
          }
          questionIds = allQuestionIds;
        } else {
          // Practice mode - use selected subjects
          const subjects = attemptData.selected_subjects as any;
          // Fetch questions for practice
          const { data: practiceQs } = await supabase
            .from('questions')
            .select('id')
            .in('subject_id', subjects.map((s: any) => s.id))
            .eq('is_active', true)
            .limit(40);
          
          questionIds = practiceQs?.map(q => q.id) || [];
        }

        // Fetch full question details (without correct answers)
        const { data: questionsData } = await supabase
          .rpc('get_exam_questions_secure', { 
            exam_question_ids: questionIds 
          });

        if (!questionsData) {
          throw new Error('Failed to load questions');
        }

        // Get subject names
        const subjectIds = [...new Set(questionsData.map(q => q.subject_id))];
        const { data: subjectsData } = await supabase
          .from('subjects')
          .select('id, name')
          .in('id', subjectIds);

        // Transform to clean format
        const transformedQuestions: CBTQuestion[] = questionsData.map((q, idx) => ({
          id: q.id,
          questionText: q.question_text,
          options: Array.isArray(q.options) ? q.options.map(opt => String(opt)) : [],
          subject: subjectsData?.find(s => s.id === q.subject_id)?.name || 'Unknown',
          displayIndex: idx
        }));

        setQuestions(transformedQuestions);

        // Load any existing answers
        const { data: existingAnswers } = await supabase
          .from('attempt_answers')
          .select('question_id, answer')
          .eq('attempt_id', attemptId);

        const loadedAnswers: CBTAnswers = {};
        existingAnswers?.forEach(a => {
          // Parse answer as integer
          const answerValue = typeof a.answer === 'number' 
            ? a.answer 
            : parseInt(String(a.answer));
          if (!isNaN(answerValue)) {
            loadedAnswers[a.question_id] = answerValue;
          }
        });
        setAnswers(loadedAnswers);

      } catch (error) {
        console.error('Error fetching questions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load exam questions',
          variant: 'destructive'
        });
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [attemptId, navigate, toast]);

  // Select answer (stores as integer)
  const selectAnswer = useCallback((questionId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  }, []);

  // Submit exam
  const submitExam = useCallback(async (timeSpentSeconds: number) => {
    if (!attemptId) return;

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user internal ID
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userData) throw new Error('User not found');

      // Validate each answer using simple integer comparison
      const validatedAnswers = [];
      let correctCount = 0;
      const subjectBreakdown: Record<string, { total: number; correct: number }> = {};

      for (const question of questions) {
        const userAnswerIndex = answers[question.id];
        const subject = question.subject;

        // Initialize subject stats
        if (!subjectBreakdown[subject]) {
          subjectBreakdown[subject] = { total: 0, correct: 0 };
        }
        subjectBreakdown[subject].total += 1;

        let isCorrect = false;

        if (userAnswerIndex !== undefined) {
          // Call simple validation function
          const { data: validationResult } = await supabase
            .rpc('validate_answer_simple', {
              question_id_param: question.id,
              submitted_index: userAnswerIndex
            });

          isCorrect = validationResult === true;
          if (isCorrect) {
            correctCount++;
            subjectBreakdown[subject].correct += 1;
          }
        }

        validatedAnswers.push({
          attempt_id: attemptId,
          question_id: question.id,
          answer: userAnswerIndex ?? null,
          is_correct: isCorrect,
          time_spent_seconds: Math.floor(timeSpentSeconds / questions.length),
          answered_at: new Date().toISOString()
        });
      }

      // Insert all answers
      const { error: answersError } = await supabase
        .from('attempt_answers')
        .upsert(validatedAnswers);

      if (answersError) throw answersError;

      // Update attempt status
      const { error: attemptError } = await supabase
        .from('attempts')
        .update({
          status: 'SUBMITTED',
          submitted_at: new Date().toISOString()
        })
        .eq('id', attemptId);

      if (attemptError) throw attemptError;

      // Calculate and insert results
      const totalQuestions = questions.length;
      const wrongAnswers = Object.keys(answers).length - correctCount;
      const unanswered = totalQuestions - Object.keys(answers).length;
      const percentage = (correctCount / totalQuestions) * 100;

      const { error: resultsError } = await supabase
        .from('results')
        .insert({
          attempt_id: attemptId,
          raw_score: correctCount,
          scaled_score: Math.round((correctCount / totalQuestions) * 400), // JAMB scale
          correct_answers: correctCount,
          wrong_answers: wrongAnswers,
          unanswered: unanswered,
          total_questions: totalQuestions,
          percentage: percentage,
          subject_breakdown: subjectBreakdown,
          time_taken_minutes: Math.floor(timeSpentSeconds / 60)
        });

      if (resultsError) throw resultsError;

      toast({
        title: 'Exam Submitted',
        description: 'Your answers have been submitted successfully'
      });

      navigate(`/results?attempt=${attemptId}`);

    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit exam. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  }, [attemptId, questions, answers, navigate, toast]);

  return {
    questions,
    answers,
    loading,
    submitting,
    selectAnswer,
    submitExam
  };
};
