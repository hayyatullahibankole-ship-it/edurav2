-- Recompute and fix inconsistent results based on attempt_answers
CREATE OR REPLACE FUNCTION public.recompute_results_for_attempt(attempt_uuid uuid)
RETURNS TABLE(
  updated boolean,
  correct integer,
  wrong integer,
  unanswered integer,
  total integer,
  percentage numeric,
  scaled_score integer
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_owns_attempt boolean;
  is_admin_user boolean;
  total_q int;
  correct_q int;
  wrong_q int;
  unanswered_q int;
  time_minutes int;
BEGIN
  -- Permissions: owner or admin
  SELECT EXISTS (
    SELECT 1 FROM public.attempts a
    JOIN public.users u ON a.user_id = u.id
    WHERE a.id = attempt_uuid AND u.auth_user_id = auth.uid()
  ) INTO user_owns_attempt;
  SELECT is_admin(auth.uid()) INTO is_admin_user;
  IF NOT (user_owns_attempt OR is_admin_user) THEN
    RAISE EXCEPTION 'Access denied to recompute results for this attempt';
  END IF;

  -- Aggregate from attempt_answers
  SELECT 
    COUNT(*)::int,
    COALESCE(SUM(CASE WHEN aa.is_correct THEN 1 ELSE 0 END),0)::int,
    COALESCE(SUM(CASE WHEN aa.answer IS NOT NULL AND NOT aa.is_correct THEN 1 ELSE 0 END),0)::int,
    COALESCE(SUM(CASE WHEN aa.answer IS NULL THEN 1 ELSE 0 END),0)::int,
    COALESCE(ROUND(SUM(aa.time_spent_seconds)::numeric/60),0)::int
  INTO total_q, correct_q, wrong_q, unanswered_q, time_minutes
  FROM public.attempt_answers aa
  WHERE aa.attempt_id = attempt_uuid;

  IF total_q IS NULL OR total_q = 0 THEN
    RETURN QUERY SELECT false, 0, 0, 0, 0, 0::numeric, 0;
    RETURN;
  END IF;

  -- Compute metrics
  PERFORM 1;
  
  -- Percentage and scaled score (JAMB style by default)
  -- percentage out of 100, scaled_score out of 400
  -- Use 4 points per correct
  RETURN QUERY
  WITH upsert AS (
    INSERT INTO public.results (
      attempt_id,
      subject_breakdown,
      auto_graded,
      graded_at,
      raw_score,
      correct_answers,
      wrong_answers,
      unanswered,
      total_questions,
      percentage,
      scaled_score,
      time_taken_minutes
    ) VALUES (
      attempt_uuid,
      '{}'::jsonb,
      true,
      now(),
      correct_q,
      correct_q,
      wrong_q,
      unanswered_q,
      total_q,
      CASE WHEN total_q > 0 THEN ROUND((correct_q::numeric / total_q::numeric) * 100, 2) ELSE 0 END,
      LEAST(400, GREATEST(0, correct_q * 4)),
      time_minutes
    )
    ON CONFLICT (attempt_id) DO UPDATE SET
      raw_score = EXCLUDED.raw_score,
      correct_answers = EXCLUDED.correct_answers,
      wrong_answers = EXCLUDED.wrong_answers,
      unanswered = EXCLUDED.unanswered,
      total_questions = EXCLUDED.total_questions,
      percentage = EXCLUDED.percentage,
      scaled_score = EXCLUDED.scaled_score,
      graded_at = now(),
      auto_graded = true,
      time_taken_minutes = EXCLUDED.time_taken_minutes
    RETURNING 1
  )
  SELECT true,
         correct_q,
         wrong_q,
         unanswered_q,
         total_q,
         CASE WHEN total_q > 0 THEN ROUND((correct_q::numeric / total_q::numeric) * 100, 2) ELSE 0 END,
         LEAST(400, GREATEST(0, correct_q * 4));
END;
$function$;