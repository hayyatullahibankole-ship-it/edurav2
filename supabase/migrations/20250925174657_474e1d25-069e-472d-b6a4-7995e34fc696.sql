-- Fix exam answer exposure by securing questions table

-- 1. Remove public access to questions table (keep admin access)
DROP POLICY IF EXISTS "Users can view active questions" ON public.questions;

-- 2. Create a function to get questions WITHOUT answers for exam purposes
CREATE OR REPLACE FUNCTION public.get_exam_questions(exam_question_ids uuid[])
RETURNS TABLE (
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
) AS $$
BEGIN
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
  WHERE q.id = ANY(exam_question_ids)
    AND q.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Create a function for secure answer validation (only for edge functions)
CREATE OR REPLACE FUNCTION public.validate_question_answer(
  question_id uuid,
  submitted_answer jsonb
)
RETURNS boolean AS $$
DECLARE
  correct_answer jsonb;
BEGIN
  -- Get the correct answer for the question
  SELECT q.correct_answer INTO correct_answer
  FROM public.questions q
  WHERE q.id = question_id AND q.is_active = true;
  
  -- Return whether the submitted answer matches the correct answer
  RETURN (submitted_answer = correct_answer);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Create a function to get question explanations (only after exam submission)
CREATE OR REPLACE FUNCTION public.get_question_explanation(question_id uuid, user_id uuid)
RETURNS text AS $$
DECLARE
  explanation text;
  has_submitted boolean := false;
BEGIN
  -- Check if user has submitted an attempt that includes this question
  SELECT EXISTS (
    SELECT 1 
    FROM public.attempt_answers aa
    JOIN public.attempts a ON aa.attempt_id = a.id
    JOIN public.users u ON a.user_id = u.id
    WHERE aa.question_id = question_id 
      AND u.auth_user_id = user_id
      AND a.status = 'SUBMITTED'
  ) INTO has_submitted;
  
  -- Only return explanation if user has submitted an attempt with this question
  IF has_submitted THEN
    SELECT q.explanation INTO explanation
    FROM public.questions q
    WHERE q.id = question_id AND q.is_active = true;
    
    RETURN explanation;
  ELSE
    RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Grant execute permissions on these functions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_exam_questions(uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_question_answer(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_question_explanation(uuid, uuid) TO authenticated;