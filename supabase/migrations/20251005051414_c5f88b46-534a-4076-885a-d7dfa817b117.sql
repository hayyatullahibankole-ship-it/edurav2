-- Patch get_review_questions_for_attempt to fix return type mismatch for subject_name
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
    q.id,
    q.question_text,
    q.options,
    -- Normalize correct answer to 0-based integer index
    CASE
      WHEN jsonb_typeof(q.correct_answer) = 'number' THEN (q.correct_answer::text)::integer
      WHEN q.correct_answer::text ~ '^"[A-D]"$' THEN ascii(upper(trim(both '"' from q.correct_answer::text))) - 65
      WHEN q.correct_answer::text ~ '^"[0-3]"$' THEN (trim(both '"' from q.correct_answer::text))::integer
      ELSE 0
    END AS correct_answer_index,
    COALESCE(q.explanation, '')::text AS explanation,
    q.subject_id,
    COALESCE(s.name::text, 'Unknown')::text AS subject_name,
    -- User answer normalized to integer if present
    CASE 
      WHEN aa.answer IS NULL THEN NULL
      WHEN jsonb_typeof(aa.answer) = 'number' THEN (aa.answer::text)::integer
      ELSE NULL
    END AS user_answer_index,
    COALESCE(aa.is_correct, false) AS is_correct,
    COALESCE(aa.time_spent_seconds, 0) AS time_spent_seconds
  FROM public.attempt_answers aa
  JOIN public.questions q ON q.id = aa.question_id
  LEFT JOIN public.subjects s ON s.id = q.subject_id
  WHERE aa.attempt_id = attempt_uuid;
END;
$function$;