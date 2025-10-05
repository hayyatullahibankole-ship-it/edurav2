-- Create admin function to delete all questions safely by clearing dependent attempt_answers first
CREATE OR REPLACE FUNCTION public.admin_delete_all_questions()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_attempt_answers integer := 0;
  deleted_questions integer := 0;
BEGIN
  -- Only allow admins to execute
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  -- Delete dependent attempt answers first to satisfy foreign keys
  DELETE FROM public.attempt_answers
  WHERE question_id IN (SELECT id FROM public.questions);
  GET DIAGNOSTICS deleted_attempt_answers = ROW_COUNT;

  -- Now delete all questions
  DELETE FROM public.questions;
  GET DIAGNOSTICS deleted_questions = ROW_COUNT;

  -- Log security event
  PERFORM log_security_event(
    'ADMIN_PURGE_QUESTIONS',
    'questions',
    NULL,
    jsonb_build_object(
      'attempt_answers_deleted', deleted_attempt_answers,
      'questions_deleted', deleted_questions
    )
  );

  RETURN jsonb_build_object(
    'attempt_answers_deleted', deleted_attempt_answers,
    'questions_deleted', deleted_questions
  );
END;
$$;