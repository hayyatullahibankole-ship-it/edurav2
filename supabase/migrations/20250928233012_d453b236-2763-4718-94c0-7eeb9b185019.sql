-- Create a safe delete function for questions that also clears dependent data
CREATE OR REPLACE FUNCTION public.delete_question_safely(qid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  is_admin_user boolean;
BEGIN
  -- Authorization: only admins
  SELECT is_admin(auth.uid()) INTO is_admin_user;
  IF NOT is_admin_user THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Delete dependent attempt answers first
  DELETE FROM public.attempt_answers WHERE question_id = qid;

  -- Finally hard-delete the question
  DELETE FROM public.questions WHERE id = qid;

  -- Log
  PERFORM log_security_event('ADMIN_DELETE_QUESTION', 'questions', qid, jsonb_build_object('cascade','attempt_answers'));
  RETURN true;
END;
$$;

-- Function to detect incomplete or low-quality questions
CREATE OR REPLACE FUNCTION public.find_incomplete_questions()
RETURNS TABLE(id uuid, reason text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  WITH base AS (
    SELECT 
      q.id,
      q.question_text,
      q.options,
      q.correct_answer,
      q.explanation
    FROM public.questions q
    WHERE q.is_active = true
  )
  SELECT id, reason FROM (
    -- Very short or blank text
    SELECT id, 'text_too_short'::text AS reason FROM base 
    WHERE question_text IS NULL OR length(trim(question_text)) < 15
    UNION ALL
    -- Missing correct answer
    SELECT id, 'missing_correct_answer' FROM base 
    WHERE correct_answer IS NULL
    UNION ALL
    -- Too few options (supports array or object)
    SELECT id, 'too_few_options' FROM base 
    WHERE (
      options IS NULL OR (
        (jsonb_typeof(options) = 'array' AND jsonb_array_length(options) < 2) OR
        (jsonb_typeof(options) = 'object' AND jsonb_array_length(jsonb_strip_nulls(options)) < 2)
      )
    )
    UNION ALL
    -- Incomplete sentence endings that suggest the question was cut off
    SELECT id, 'incomplete_sentence' FROM base 
    WHERE question_text ~ '(should be|is:|are:)\s*$'
       OR question_text ~ '(towards is|following is)\s*$'
       OR question_text ~ '(means of|on \?)\s*$'
  ) t;
$$;

-- Delete all incomplete questions
DELETE FROM public.attempt_answers 
WHERE question_id IN (
  SELECT id FROM public.find_incomplete_questions()
);

DELETE FROM public.questions 
WHERE id IN (
  SELECT id FROM public.find_incomplete_questions()
);