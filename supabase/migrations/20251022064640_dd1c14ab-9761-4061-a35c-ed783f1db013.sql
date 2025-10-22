-- 1) Ensure validator safely handles text values like 'English' by wrapping with to_jsonb
DROP FUNCTION IF EXISTS public.validate_student_answer(uuid, jsonb);

CREATE OR REPLACE FUNCTION public.validate_student_answer(question_id_param uuid, submitted_answer jsonb)
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
  -- Load as JSONB safely
  SELECT to_jsonb(q.correct_answer), q.options INTO correct_answer, question_options
  FROM public.questions q
  WHERE q.id = question_id_param AND q.is_active = true;

  IF correct_answer IS NULL THEN
    RETURN false;
  END IF;

  submitted_value := submitted_answer #>> '{}';
  correct_value := correct_answer #>> '{}';

  -- Direct text match
  IF submitted_value = correct_value THEN RETURN true; END IF;

  -- Parse indices
  BEGIN submitted_index := submitted_value::integer; EXCEPTION WHEN OTHERS THEN submitted_index := -1; END;
  BEGIN correct_index := correct_value::integer; EXCEPTION WHEN OTHERS THEN correct_index := -1; END;

  IF submitted_index >= 0 AND correct_index >= 0 AND submitted_index = correct_index THEN RETURN true; END IF;

  -- Letter -> index
  IF submitted_value ~ '^[A-Da-d]$' THEN submitted_index := ascii(upper(submitted_value)) - 65; END IF;
  IF correct_value ~ '^[A-Da-d]$' THEN correct_index := ascii(upper(correct_value)) - 65; END IF;

  IF submitted_index >= 0 AND correct_index >= 0 AND submitted_index = correct_index THEN RETURN true; END IF;

  -- Compare option text
  IF question_options IS NOT NULL THEN
    IF correct_index >= 0 AND jsonb_typeof(question_options) = 'array' THEN
      option_text := question_options ->> correct_index;
      IF option_text IS NOT NULL AND lower(trim(option_text)) = lower(trim(submitted_value)) THEN RETURN true; END IF;
    ELSIF correct_index >= 0 AND jsonb_typeof(question_options) = 'object' THEN
      option_text := question_options ->> chr(65 + correct_index);
      IF option_text IS NOT NULL AND lower(trim(option_text)) = lower(trim(submitted_value)) THEN RETURN true; END IF;
    END IF;

    IF submitted_index >= 0 AND jsonb_typeof(question_options) = 'array' THEN
      option_text := question_options ->> submitted_index;
      IF option_text IS NOT NULL AND lower(trim(option_text)) = lower(trim(correct_value)) THEN RETURN true; END IF;
    ELSIF submitted_index >= 0 AND jsonb_typeof(question_options) = 'object' THEN
      option_text := question_options ->> chr(65 + submitted_index);
      IF option_text IS NOT NULL AND lower(trim(option_text)) = lower(trim(correct_value)) THEN RETURN true; END IF;
    END IF;
  END IF;

  RETURN false;
END;
$$;

-- 2) Re-point the submit trigger to use recompute_results_for_attempt (more robust unanswered counting)
CREATE OR REPLACE FUNCTION public.trigger_compute_results()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'SUBMITTED' AND (OLD.status IS NULL OR OLD.status <> 'SUBMITTED') THEN
    PERFORM public.recompute_results_for_attempt(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS compute_results_on_submit ON public.attempts;
CREATE TRIGGER compute_results_on_submit
AFTER UPDATE ON public.attempts
FOR EACH ROW
EXECUTE FUNCTION public.trigger_compute_results();