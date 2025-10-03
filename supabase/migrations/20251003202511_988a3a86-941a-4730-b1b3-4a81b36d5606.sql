-- Drop the existing function and create an improved one
DROP FUNCTION IF EXISTS public.validate_student_answer(uuid, jsonb);

-- Create improved answer validation function that handles all formats
CREATE OR REPLACE FUNCTION public.validate_student_answer(
  question_id_param uuid,
  submitted_answer jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  correct_answer jsonb;
  question_options jsonb;
  submitted_value text;
  correct_value text;
  submitted_index integer;
  correct_index integer;
  option_text text;
BEGIN
  -- Get the question data
  SELECT q.correct_answer, q.options INTO correct_answer, question_options
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
$$;