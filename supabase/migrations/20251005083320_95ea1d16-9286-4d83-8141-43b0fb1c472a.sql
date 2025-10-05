-- Improve recomputation logic to recalc correctness using validator
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
  answered_q int;
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

  -- Aggregate from attempt_answers, recomputing correctness via validator
  SELECT 
    COUNT(*)::int AS total_cnt,
    COALESCE(SUM(CASE WHEN aa.answer IS NOT NULL AND public.validate_student_answer(aa.question_id, aa.answer) THEN 1 ELSE 0 END),0)::int AS correct_cnt,
    COALESCE(SUM(CASE WHEN aa.answer IS NOT NULL THEN 1 ELSE 0 END),0)::int AS answered_cnt,
    COALESCE(ROUND(SUM(aa.time_spent_seconds)::numeric/60),0)::int AS minutes_spent
  INTO total_q, correct_q, answered_q, time_minutes
  FROM public.attempt_answers aa
  WHERE aa.attempt_id = attempt_uuid;

  IF total_q IS NULL OR total_q = 0 THEN
    RETURN QUERY SELECT false, 0, 0, 0, 0, 0::numeric, 0;
    RETURN;
  END IF;

  wrong_q := GREATEST(answered_q - correct_q, 0);
  unanswered_q := GREATEST(total_q - answered_q, 0);

  -- Upsert into results
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
      ROUND((correct_q::numeric / total_q::numeric) * 100, 2),
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
         ROUND((correct_q::numeric / total_q::numeric) * 100, 2),
         LEAST(400, GREATEST(0, correct_q * 4));
END;
$function$;

-- Ensure future attempt_answers rows compute correctness on write
CREATE OR REPLACE FUNCTION public.set_attempt_answer_correctness()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.answer IS NULL THEN
    NEW.is_correct := NULL;
  ELSE
    NEW.is_correct := public.validate_student_answer(NEW.question_id, NEW.answer);
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_attempt_answers_set_correct ON public.attempt_answers;
CREATE TRIGGER trg_attempt_answers_set_correct
BEFORE INSERT OR UPDATE OF answer ON public.attempt_answers
FOR EACH ROW
EXECUTE FUNCTION public.set_attempt_answer_correctness();