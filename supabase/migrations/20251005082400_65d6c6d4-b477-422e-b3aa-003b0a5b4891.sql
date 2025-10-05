-- Fix grading and review by handling text-based correct_answer reliably
-- 1) Update get_review_questions_for_attempt to avoid jsonb_typeof(text) and map letters/numbers
CREATE OR REPLACE FUNCTION public.get_review_questions_for_attempt(attempt_uuid uuid)
 RETURNS TABLE(
  id uuid,
  question_text text,
  options jsonb,
  correct_answer_index integer,
  explanation text,
  subject_id uuid,
  subject_name text,
  user_answer_index integer,
  is_correct boolean,
  time_spent_seconds integer
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_owns_attempt boolean;
  is_admin_user boolean;
  attempt_status attempt_status;
BEGIN
  -- Check ownership or admin and ensure attempt is submitted
  SELECT EXISTS (
    SELECT 1 FROM public.attempts a
    JOIN public.users u ON a.user_id = u.id
    WHERE a.id = attempt_uuid AND u.auth_user_id = auth.uid()
  ) INTO user_owns_attempt;

  SELECT is_admin(auth.uid()) INTO is_admin_user;
  SELECT a.status INTO attempt_status FROM public.attempts a WHERE a.id = attempt_uuid;

  IF NOT (user_owns_attempt OR is_admin_user) THEN
    RAISE EXCEPTION 'Access denied to attempt data';
  END IF;

  IF attempt_status != 'SUBMITTED' THEN
    RAISE EXCEPTION 'Review is only available for submitted attempts';
  END IF;

  RETURN QUERY
  SELECT 
    q.id::uuid AS id,
    q.question_text::text AS question_text,
    q.options::jsonb AS options,
    (
      CASE
        -- Numeric indices stored as plain text: 0..3
        WHEN q.correct_answer ~ '^\s*[0-3]\s*$' THEN (q.correct_answer)::integer
        -- Numeric indices stored with quotes: "0".."3"
        WHEN q.correct_answer ~ '^\s*"[0-3]"\s*$' THEN (trim(both '"' from q.correct_answer))::integer
        -- Letter A-D (any case), with or without quotes
        WHEN q.correct_answer ~ '^\s*[A-Da-d]\s*$' THEN ascii(upper(trim(q.correct_answer))) - 65
        WHEN q.correct_answer ~ '^\s*"[A-Da-d]"\s*$' THEN ascii(upper(trim(both '"' from q.correct_answer))) - 65
        ELSE 0
      END
    )::integer AS correct_answer_index,
    COALESCE(q.explanation, '')::text AS explanation,
    q.subject_id::uuid AS subject_id,
    COALESCE(s.name, 'Unknown')::text AS subject_name,
    (
      CASE 
        WHEN aa.answer IS NULL THEN NULL
        WHEN jsonb_typeof(aa.answer) = 'number' THEN (aa.answer::text)::integer
        WHEN jsonb_typeof(aa.answer) = 'string' AND (aa.answer::text) ~ '^"[A-Da-d]"$' THEN ascii(upper(trim(both '"' from aa.answer::text))) - 65
        ELSE NULL
      END
    )::integer AS user_answer_index,
    COALESCE(aa.is_correct, false)::boolean AS is_correct,
    COALESCE(aa.time_spent_seconds, 0)::integer AS time_spent_seconds
  FROM public.attempt_answers aa
  JOIN public.questions q ON q.id = aa.question_id
  LEFT JOIN public.subjects s ON s.id = q.subject_id
  WHERE aa.attempt_id = attempt_uuid;
END;
$function$;

-- 2) Make validate_question_answer delegate to robust validator
CREATE OR REPLACE FUNCTION public.validate_question_answer(question_id uuid, submitted_answer jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN public.validate_student_answer(question_id, submitted_answer);
END;
$function$;

-- 3) Harden validate_student_answer to avoid invalid JSON cast from text answers
CREATE OR REPLACE FUNCTION public.validate_student_answer(question_id_param uuid, submitted_answer jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  correct_answer jsonb;
  question_options jsonb;
  submitted_value text;
  correct_value text;
  submitted_index integer;
  correct_index integer;
  option_text text;
BEGIN
  -- Get the question data; cast correct_answer text into JSONB safely as a JSON string
  SELECT to_jsonb(q.correct_answer), q.options INTO correct_answer, question_options
  FROM public.questions q
  WHERE q.id = question_id_param AND q.is_active = true;
  
  IF correct_answer IS NULL THEN
    RETURN false;
  END IF;
  
  -- Extract submitted value as text
  submitted_value := submitted_answer #>> '{}';
  correct_value := correct_answer #>> '{}';
  
  -- CASE 1: Direct text match
  IF submitted_value = correct_value THEN
    RETURN true;
  END IF;
  
  -- CASE 2: Handle index-based validation (0, 1, 2, 3)
  -- Try to parse submitted answer as integer index
  BEGIN
    submitted_index := submitted_value::integer;
  EXCEPTION
    WHEN OTHERS THEN
      submitted_index := -1;
  END;
  
  -- Try to parse correct answer as integer index
  BEGIN
    correct_index := correct_value::integer;
  EXCEPTION
    WHEN OTHERS THEN
      correct_index := -1;
  END;
  
  -- If both are valid indices, compare them
  IF submitted_index >= 0 AND correct_index >= 0 THEN
    IF submitted_index = correct_index THEN
      RETURN true;
    END IF;
  END IF;
  
  -- CASE 3: Convert letter answers to indices (A=0, B=1, C=2, D=3)
  IF submitted_value ~ '^[A-D]$' THEN
    submitted_index := ascii(submitted_value) - ascii('A');
  ELSIF submitted_value ~ '^[a-d]$' THEN
    submitted_index := ascii(upper(submitted_value)) - ascii('A');
  END IF;
  
  IF correct_value ~ '^[A-D]$' THEN
    correct_index := ascii(correct_value) - ascii('A');
  ELSIF correct_value ~ '^[a-d]$' THEN
    correct_index := ascii(upper(correct_value)) - ascii('A');
  END IF;
  
  -- Compare indices if both are valid
  IF submitted_index >= 0 AND correct_index >= 0 THEN
    IF submitted_index = correct_index THEN
      RETURN true;
    END IF;
  END IF;
  
  -- CASE 4: Check if submitted answer matches the option text at correct index
  -- This handles cases where correct_answer is an index but submitted is text
  IF correct_index >= 0 AND correct_index <= 3 AND question_options IS NOT NULL THEN
    -- Handle both array and object format for options
    IF jsonb_typeof(question_options) = 'array' THEN
      option_text := question_options ->> correct_index;
      IF option_text IS NOT NULL AND (
        submitted_value = option_text OR
        submitted_value ILIKE option_text OR
        lower(trim(submitted_value)) = lower(trim(option_text))
      ) THEN
        RETURN true;
      END IF;
    ELSIF jsonb_typeof(question_options) = 'object' THEN
      -- For object format {A: "text", B: "text", ...}
      option_text := question_options ->> chr(65 + correct_index); -- Convert index to letter
      IF option_text IS NOT NULL AND (
        submitted_value = option_text OR
        submitted_value ILIKE option_text OR
        lower(trim(submitted_value)) = lower(trim(option_text))
      ) THEN
        RETURN true;
      END IF;
    END IF;
  END IF;
  
  -- CASE 5: Check if correct answer is text and submitted is index
  IF submitted_index >= 0 AND submitted_index <= 3 AND question_options IS NOT NULL THEN
    -- Handle both array and object format for options
    IF jsonb_typeof(question_options) = 'array' THEN
      option_text := question_options ->> submitted_index;
      IF option_text IS NOT NULL AND (
        correct_value = option_text OR
        correct_value ILIKE option_text OR
        lower(trim(correct_value)) = lower(trim(option_text))
      ) THEN
        RETURN true;
      END IF;
    ELSIF jsonb_typeof(question_options) = 'object' THEN
      option_text := question_options ->> chr(65 + submitted_index);
      IF option_text IS NOT NULL AND (
        correct_value = option_text OR
        correct_value ILIKE option_text OR
        lower(trim(correct_value)) = lower(trim(option_text))
      ) THEN
        RETURN true;
      END IF;
    END IF;
  END IF;
  
  -- Log validation for debugging
  PERFORM log_security_event(
    'ANSWER_VALIDATION_DETAILED',
    'questions',
    question_id_param,
    jsonb_build_object(
      'submitted_answer', submitted_answer,
      'submitted_value', submitted_value,
      'submitted_index', submitted_index,
      'correct_answer', correct_answer,
      'correct_value', correct_value,
      'correct_index', correct_index,
      'options_type', jsonb_typeof(question_options),
      'result', false
    )
  );
  
  RETURN false;
END;
$function$;