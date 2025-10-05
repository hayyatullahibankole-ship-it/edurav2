import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// Deterministic shuffle utilities to keep option order stable per attempt
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
export interface CBTQuestion {
  id: string;
  questionText: string;
  options: string[]; // Already shuffled for display
  originalIndexMap: number[]; // Maps displayed index to original DB index
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

        // Fetch questions using secure RPCs
        let questionsData: any[] = [];

        if (attemptData.exam_id) {
          // Standard exam - use exam blueprint
          const { data: examQs, error: examError } = await supabase
            .rpc('get_random_questions_for_exam', { 
              target_exam_id: attemptData.exam_id 
            });
          
          if (examError) throw examError;
          questionsData = examQs || [];
        } else {
          // Practice mode - use selected subjects
          const subjects = attemptData.selected_subjects as any;
          if (!subjects || subjects.length === 0) {
            throw new Error('No subjects selected for practice');
          }
          
          const { data: practiceQs, error: practiceError } = await supabase
            .rpc('get_random_questions_for_subjects', { 
              subject_ids: subjects.map((s: any) => s.id),
              per_subject_count: 10
            });
          
          if (practiceError) throw practiceError;
          questionsData = practiceQs || [];
        }

        if (!questionsData || questionsData.length === 0) {
          throw new Error('No questions available for this exam');
        }

        // Get subject names
        const subjectIds = [...new Set(questionsData.map(q => q.subject_id))];
        const { data: subjectsData } = await supabase
          .from('subjects')
          .select('id, name')
          .in('id', subjectIds);

        // Transform to clean format with stable shuffled options
        const attemptSeed = strHash(attemptId);
        const transformedQuestions: CBTQuestion[] = questionsData.map((q, idx) => {
          const originalOptions = Array.isArray(q.options) 
            ? q.options.map((opt: any) => String(opt)) 
            : [];
          
          // Generate deterministic shuffle for this question in this attempt
          const questionSeed = attemptSeed ^ strHash(q.id);
          const shuffleMap = shuffledIndices(originalOptions.length, questionSeed);
          
          // Shuffle options using the map
          const shuffledOptions = shuffleMap.map(origIdx => originalOptions[origIdx]);
          
          return {
            id: q.id,
            questionText: q.question_text,
            options: shuffledOptions,
            originalIndexMap: shuffleMap, // Store mapping: displayIdx -> originalIdx
            subject: subjectsData?.find(s => s.id === q.subject_id)?.name || 'Unknown',
            displayIndex: idx
          };
        });

        setQuestions(transformedQuestions);

        // Load any existing answers and map to display indices
        const { data: existingAnswers } = await supabase
          .from('attempt_answers')
          .select('question_id, answer')
          .eq('attempt_id', attemptId);

        const loadedAnswers: CBTAnswers = {};
        existingAnswers?.forEach(a => {
          const question = transformedQuestions.find(q => q.id === a.question_id);
          if (!question) return;
          
          // Parse stored answer (original index from DB)
          const originalIndex = typeof a.answer === 'number' 
            ? a.answer 
            : parseInt(String(a.answer));
          
          if (isNaN(originalIndex)) return;
          
          // Map original index to display index using reverse lookup
          const displayIndex = question.originalIndexMap.indexOf(originalIndex);
          if (displayIndex !== -1) {
            loadedAnswers[a.question_id] = displayIndex;
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

  // Select answer (stores display index, will be mapped to original on submit)
  const selectAnswer = useCallback((questionId: string, displayIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: displayIndex }));
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
        const displayIndex = answers[question.id];
        const subject = question.subject;

        // Initialize subject stats
        if (!subjectBreakdown[subject]) {
          subjectBreakdown[subject] = { total: 0, correct: 0 };
        }
        subjectBreakdown[subject].total += 1;

        let isCorrect = false;
        let originalIndex: number | null = null;

        if (displayIndex !== undefined) {
          // Map display index back to original DB index
          originalIndex = question.originalIndexMap[displayIndex];
          
          // Call simple validation function with original index
          const { data: validationResult } = await supabase
            .rpc('validate_answer_simple', {
              question_id_param: question.id,
              submitted_index: originalIndex
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
          answer: originalIndex, // Store original index in DB
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
