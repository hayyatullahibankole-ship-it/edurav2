-- Replace admin_delete_all_questions with a more robust, FK-safe truncation
CREATE OR REPLACE FUNCTION public.admin_delete_all_questions()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  aa_count integer := 0;
  q_count integer := 0;
BEGIN
  -- Admin check
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  -- Count before deletion for reporting
  SELECT COUNT(*) INTO aa_count FROM public.attempt_answers WHERE question_id IS NOT NULL;
  SELECT COUNT(*) INTO q_count FROM public.questions;

  -- Use TRUNCATE with CASCADE to safely clear dependent rows
  -- Truncate attempt_answers first (explicit), then questions
  TRUNCATE TABLE public.attempt_answers RESTART IDENTITY;
  TRUNCATE TABLE public.questions RESTART IDENTITY CASCADE;

  -- Log
  PERFORM log_security_event(
    'ADMIN_PURGE_QUESTIONS',
    'questions',
    NULL,
    jsonb_build_object(
      'attempt_answers_deleted', aa_count,
      'questions_deleted', q_count,
      'method', 'TRUNCATE_CASCADE'
    )
  );

  RETURN jsonb_build_object(
    'attempt_answers_deleted', aa_count,
    'questions_deleted', q_count
  );
END;
$$;