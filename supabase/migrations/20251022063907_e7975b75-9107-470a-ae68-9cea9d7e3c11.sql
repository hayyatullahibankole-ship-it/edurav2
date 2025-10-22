-- Drop and recreate recompute_results_for_attempt with improved unanswered counting
DROP FUNCTION IF EXISTS public.recompute_results_for_attempt(uuid);

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
  attempt_record record;
  expected_total_questions int := 0;
  answered_q int := 0;
  correct_q int := 0;
  wrong_q int := 0;
  unanswered_q int := 0;
  time_minutes int := 0;
  allowed boolean;
BEGIN
  -- Permissions: owner or admin
  SELECT EXISTS (
    SELECT 1 FROM public.attempts a JOIN public.users u ON a.user_id = u.id
    WHERE a.id = attempt_uuid AND u.auth_user_id = auth.uid()
  ) INTO allowed;
  IF NOT allowed AND NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied to recompute results for this attempt';
  END IF;

  -- Load attempt with exam details
  SELECT a.*, e.total_questions AS exam_total_questions
  INTO attempt_record
  FROM public.attempts a
  LEFT JOIN public.exams e ON e.id = a.exam_id
  WHERE a.id = attempt_uuid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Attempt not found: %', attempt_uuid;
  END IF;

  -- Determine expected total questions
  expected_total_questions := COALESCE(
    attempt_record.exam_total_questions,
    CASE 
      WHEN attempt_record.proctoring_data ? 'question_count_per_subject' 
           AND attempt_record.selected_subjects IS NOT NULL THEN 
        (attempt_record.proctoring_data->>'question_count_per_subject')::int *
        COALESCE(jsonb_array_length(attempt_record.selected_subjects), 0)
      ELSE NULL
    END,
    (attempt_record.proctoring_data->>'total_questions')::int,
    (attempt_record.proctoring_data->>'question_count')::int,
    0
  );

  -- Aggregate from attempt_answers (only answered rows exist in new flow)
  SELECT 
    COALESCE(SUM(CASE WHEN aa.answer IS NOT NULL AND public.validate_student_answer(aa.question_id, aa.answer) THEN 1 ELSE 0 END),0)::int AS correct_cnt,
    COALESCE(SUM(CASE WHEN aa.answer IS NOT NULL THEN 1 ELSE 0 END),0)::int AS answered_cnt,
    COALESCE(ROUND(SUM(aa.time_spent_seconds)::numeric/60),0)::int AS minutes_spent
  INTO correct_q, answered_q, time_minutes
  FROM public.attempt_answers aa
  WHERE aa.attempt_id = attempt_uuid;

  wrong_q := GREATEST(answered_q - correct_q, 0);

  IF expected_total_questions > 0 THEN
    unanswered_q := GREATEST(expected_total_questions - answered_q, 0);
  ELSE
    -- Fallback: if we don't know the expected total, use answered count as total
    expected_total_questions := answered_q;
    unanswered_q := 0;
  END IF;

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
      expected_total_questions,
      CASE WHEN expected_total_questions > 0 THEN ROUND((correct_q::numeric / expected_total_questions::numeric) * 100, 2) ELSE 0 END,
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
         expected_total_questions,
         CASE WHEN expected_total_questions > 0 THEN ROUND((correct_q::numeric / expected_total_questions::numeric) * 100, 2) ELSE 0 END,
         LEAST(400, GREATEST(0, correct_q * 4));
END;
$function$;