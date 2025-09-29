-- Fix the validate_student_answer function to handle both numeric and letter formats
CREATE OR REPLACE FUNCTION public.validate_student_answer(question_id_param uuid, submitted_answer jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  correct_answer jsonb;
  submitted_value text;
  correct_value text;
  submitted_numeric integer;
  correct_numeric integer;
BEGIN
  -- Get the correct answer for the question
  SELECT q.correct_answer INTO correct_answer
  FROM public.questions q
  WHERE q.id = question_id_param AND q.is_active = true;
  
  IF correct_answer IS NULL THEN
    RETURN false;
  END IF;
  
  -- Handle different answer formats
  -- Convert submitted answer to text for comparison
  submitted_value := submitted_answer #>> '{}';
  
  -- Convert correct answer to text
  correct_value := correct_answer #>> '{}';
  
  -- Try direct comparison first
  IF submitted_value = correct_value THEN
    RETURN true;
  END IF;
  
  -- Handle letter to number conversion (A=0, B=1, C=2, D=3)
  IF submitted_value ~ '^[A-D]$' THEN
    submitted_numeric := ascii(submitted_value) - ascii('A');
    
    -- Try to convert correct answer to number
    BEGIN
      correct_numeric := correct_value::integer;
      IF submitted_numeric = correct_numeric THEN
        RETURN true;
      END IF;
    EXCEPTION
      WHEN others THEN
        -- Continue with other comparisons
    END;
  END IF;
  
  -- Handle number to letter conversion
  IF submitted_value ~ '^[0-3]$' THEN
    submitted_numeric := submitted_value::integer;
    
    -- Convert correct answer if it's a letter
    IF correct_value ~ '^[A-D]$' THEN
      correct_numeric := ascii(correct_value) - ascii('A');
      IF submitted_numeric = correct_numeric THEN
        RETURN true;
      END IF;
    END IF;
  END IF;
  
  -- Log this validation attempt for debugging
  PERFORM log_security_event(
    'ANSWER_VALIDATION',
    'questions',
    question_id_param,
    jsonb_build_object(
      'submitted_answer', submitted_answer,
      'correct_answer', correct_answer,
      'submitted_value', submitted_value,
      'correct_value', correct_value,
      'user_id', auth.uid(),
      'result', false
    )
  );
  
  RETURN false;
END;
$$;