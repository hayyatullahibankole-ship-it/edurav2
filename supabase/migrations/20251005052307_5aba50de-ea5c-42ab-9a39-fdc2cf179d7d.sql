-- Fix validate_answer_simple to handle all answer formats
CREATE OR REPLACE FUNCTION public.validate_answer_simple(question_id_param uuid, submitted_index integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  correct_index integer;
BEGIN
  -- Get correct answer as integer, handling all formats
  SELECT 
    CASE 
      -- Already a number
      WHEN jsonb_typeof(correct_answer) = 'number' THEN (correct_answer::text)::integer
      -- Letter format: "A", "B", "C", "D"
      WHEN correct_answer::text ~ '^"[A-D]"$' THEN ascii(upper(trim(both '"' from correct_answer::text))) - 65
      -- String number: "0", "1", "2", "3"
      WHEN correct_answer::text ~ '^"[0-3]"$' THEN (trim(both '"' from correct_answer::text))::integer
      ELSE NULL
    END INTO correct_index
  FROM public.questions
  WHERE id = question_id_param AND is_active = true;
  
  -- Simple comparison
  RETURN (submitted_index = correct_index);
END;
$function$;