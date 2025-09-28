-- CRITICAL SECURITY FIX: Secure Questions Table Access
-- The current RLS policies allow students to see correct answers and explanations
-- This fixes the vulnerability by implementing proper column-level security

-- First, drop existing permissive policies that expose sensitive data
DROP POLICY IF EXISTS "Users can view questions without answers from active attempts" ON public.questions;
DROP POLICY IF EXISTS "Users can view submitted questions without answers" ON public.questions;

-- Create secure policy: Only admins can access questions table directly
CREATE POLICY "Only admins can access questions directly"
ON public.questions
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Create secure function for students to get questions during active attempts (WITHOUT answers)
CREATE OR REPLACE FUNCTION public.get_student_exam_questions(attempt_id_param uuid)
RETURNS TABLE(
  id uuid,
  question_text text,
  type question_type,
  options jsonb,
  difficulty_level integer,
  media_urls jsonb,
  points numeric,
  time_limit_seconds integer,
  subject_id uuid,
  tags jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verify user owns this attempt and it's active
  IF NOT EXISTS (
    SELECT 1 FROM attempts a
    JOIN users u ON a.user_id = u.id
    WHERE a.id = attempt_id_param 
      AND u.auth_user_id = auth.uid()
      AND a.status IN ('STARTED', 'IN_PROGRESS')
  ) THEN
    RAISE EXCEPTION 'Access denied to attempt questions';
  END IF;

  -- Return questions WITHOUT correct answers or explanations
  RETURN QUERY
  SELECT 
    q.id,
    q.question_text,
    q.type,
    q.options,
    q.difficulty_level,
    q.media_urls,
    q.points,
    q.time_limit_seconds,
    q.subject_id,
    q.tags
  FROM public.questions q
  JOIN attempts a ON a.id = attempt_id_param
  WHERE q.is_active = true
    AND q.subject_id = ANY(
      SELECT jsonb_array_elements_text(a.selected_subjects)::uuid
    );
END;
$$;

-- Create secure function for getting question explanations (only after submission)
CREATE OR REPLACE FUNCTION public.get_question_explanation_secure(question_id_param uuid)
RETURNS TABLE(explanation text, correct_answer jsonb)
LANGUAGE plpgsql  
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  has_submitted boolean := false;
BEGIN
  -- Check if user has submitted an attempt that includes this question
  SELECT EXISTS (
    SELECT 1 
    FROM public.attempt_answers aa
    JOIN public.attempts a ON aa.attempt_id = a.id
    JOIN public.users u ON a.user_id = u.id
    WHERE aa.question_id = question_id_param
      AND u.auth_user_id = auth.uid()
      AND a.status = 'SUBMITTED'
  ) INTO has_submitted;
  
  -- Only return explanation if user has submitted an attempt with this question
  IF has_submitted THEN
    RETURN QUERY
    SELECT q.explanation, q.correct_answer
    FROM public.questions q
    WHERE q.id = question_id_param AND q.is_active = true;
  ELSE
    -- Return empty result for unauthorized access
    RETURN;
  END IF;
END;
$$;

-- Create function to validate question answers securely (without exposing correct answer)
CREATE OR REPLACE FUNCTION public.validate_student_answer(question_id_param uuid, submitted_answer jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER  
SET search_path = 'public'
AS $$
DECLARE
  correct_answer jsonb;
  is_correct boolean;
BEGIN
  -- Get the correct answer for the question
  SELECT q.correct_answer INTO correct_answer
  FROM public.questions q
  WHERE q.id = question_id_param AND q.is_active = true;
  
  -- Return whether the submitted answer matches the correct answer
  is_correct := (submitted_answer = correct_answer);
  
  -- Log this validation attempt for security monitoring
  PERFORM log_security_event(
    'ANSWER_VALIDATION',
    'questions',
    question_id_param,
    jsonb_build_object(
      'is_correct', is_correct,
      'user_id', auth.uid()
    )
  );
  
  RETURN is_correct;
END;
$$;

-- Grant execute permissions to authenticated users for the secure functions
GRANT EXECUTE ON FUNCTION public.get_student_exam_questions(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_question_explanation_secure(uuid) TO authenticated;  
GRANT EXECUTE ON FUNCTION public.validate_student_answer(uuid, jsonb) TO authenticated;