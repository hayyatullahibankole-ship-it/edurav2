-- Fix mock exam attempt creation by adding RPC function with SECURITY DEFINER
-- This allows anonymous users to create attempts for mock exams without RLS issues

-- Create RPC function to create mock exam attempts
CREATE OR REPLACE FUNCTION public.create_mock_exam_attempt(
  p_exam_id TEXT,
  p_registration_id UUID,
  p_registration_number TEXT,
  p_exam_duration_minutes INT DEFAULT 120,
  p_exam_title TEXT DEFAULT 'AKBOY JAMB Mock Examination'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  attempt_id UUID;
  proctoring_data JSONB;
  exam_uuid UUID;
BEGIN
  -- Verify registration exists and is in valid state
  IF NOT EXISTS (
    SELECT 1 FROM public.mock_registrations
    WHERE id = p_registration_id
      AND registration_number = p_registration_number
      AND exam_status IN ('registered', 'started')
  ) THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', 'Invalid registration or exam not ready'
    );
  END IF;

  -- Try to convert p_exam_id to UUID, or use NULL if it's not a valid UUID
  BEGIN
    exam_uuid := p_exam_id::uuid;
  EXCEPTION WHEN OTHERS THEN
    exam_uuid := NULL;
  END;

  -- Build proctoring data
  proctoring_data := jsonb_build_object(
    'mock_registration_id', p_registration_id,
    'registration_number', p_registration_number,
    'title', p_exam_title,
    'duration_minutes', p_exam_duration_minutes,
    'is_mock', true
  );

  -- Create attempt record
  BEGIN
    INSERT INTO public.attempts (
      user_id,
      exam_id,
      status,
      time_remaining_seconds,
      proctoring_data
    ) VALUES (
      NULL,  -- Anonymous attempt
      exam_uuid,  -- UUID or NULL
      'STARTED',
      p_exam_duration_minutes * 60,
      proctoring_data
    )
    RETURNING id INTO attempt_id;

    -- Return success with attempt ID
    RETURN jsonb_build_object(
      'status', 'success',
      'attempt_id', attempt_id
    );
  EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', SQLERRM,
      'detail', SQLSTATE
    );
  END;
END;
$$;

-- Create RPC function to submit mock exam answers
CREATE OR REPLACE FUNCTION public.submit_mock_exam_answers(
  p_attempt_id UUID,
  p_answers JSONB
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  answer_record JSONB;
  inserted_count INT := 0;
BEGIN
  -- Verify attempt exists and is for a mock exam
  IF NOT EXISTS (
    SELECT 1 FROM public.attempts
    WHERE id = p_attempt_id
      AND user_id IS NULL
      AND proctoring_data IS NOT NULL
      AND (proctoring_data->>'is_mock')::boolean = true
  ) THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', 'Invalid attempt or not a mock exam'
    );
  END IF;

  -- Insert answers (p_answers should be an array of {question_id, selected_answer} objects)
  BEGIN
    INSERT INTO public.attempt_answers (attempt_id, question_id, answer)
    SELECT 
      p_attempt_id,
      (obj->>'question_id')::uuid,
      -- use jsonb value for answer column (obj->'selected_answer' returns jsonb)
      obj->'selected_answer'
    FROM jsonb_array_elements(p_answers) AS obj
    ON CONFLICT (attempt_id, question_id) DO UPDATE
    SET answer = EXCLUDED.answer;

    GET DIAGNOSTICS inserted_count = ROW_COUNT;

    -- Return success
    RETURN jsonb_build_object(
      'status', 'success',
      'answers_inserted', inserted_count
    );
  EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', SQLERRM,
      'detail', SQLSTATE
    );
  END;
END;
$$;

-- Create RPC function to submit mock exam (update status)
CREATE OR REPLACE FUNCTION public.submit_mock_exam(
  p_attempt_id UUID
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify attempt exists and is for a mock exam
  IF NOT EXISTS (
    SELECT 1 FROM public.attempts
    WHERE id = p_attempt_id
      AND user_id IS NULL
      AND proctoring_data IS NOT NULL
      AND (proctoring_data->>'is_mock')::boolean = true
  ) THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', 'Invalid attempt or not a mock exam'
    );
  END IF;

  -- Update attempt status to SUBMITTED
  BEGIN
    UPDATE public.attempts
    SET status = 'SUBMITTED'
    WHERE id = p_attempt_id;

    -- Return success
    RETURN jsonb_build_object(
      'status', 'success',
      'message', 'Exam submitted successfully'
    );
  EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', SQLERRM,
      'detail', SQLSTATE
    );
  END;
END;
$$;

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.create_mock_exam_attempt TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.submit_mock_exam_answers TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.submit_mock_exam TO authenticated, anon;

-- Also add an RLS policy to allow anonymous inserts with proper checks
-- This provides an additional layer of security
DROP POLICY IF EXISTS "Mock exam attempts unauthenticated insert" ON public.attempts;
CREATE POLICY "Mock exam attempts unauthenticated insert"
  ON public.attempts FOR INSERT
  WITH CHECK (
    user_id IS NULL
    AND proctoring_data IS NOT NULL
    AND (proctoring_data->>'is_mock')::boolean = true
    AND EXISTS (
      SELECT 1 FROM public.mock_registrations
      WHERE id = (proctoring_data->>'mock_registration_id')::uuid
        AND registration_number = proctoring_data->>'registration_number'
        AND exam_status IN ('registered', 'started')
    )
  );

-- Add SELECT policy for mock attempts
DROP POLICY IF EXISTS "Mock exam attempts select by registration" ON public.attempts;
CREATE POLICY "Mock exam attempts select by registration"
  ON public.attempts FOR SELECT
  USING (
    user_id IS NULL
    AND proctoring_data IS NOT NULL
    AND (proctoring_data->>'is_mock')::boolean = true
  );

-- Add UPDATE policy for mock attempts
DROP POLICY IF EXISTS "Mock exam attempts update status" ON public.attempts;
CREATE POLICY "Mock exam attempts update status"
  ON public.attempts FOR UPDATE
  USING (
    user_id IS NULL
    AND proctoring_data IS NOT NULL
    AND (proctoring_data->>'is_mock')::boolean = true
  )
  WITH CHECK (
    user_id IS NULL
    AND proctoring_data IS NOT NULL
    AND (proctoring_data->>'is_mock')::boolean = true
  );

-- Add RLS policy for attempt_answers for mock exams
DROP POLICY IF EXISTS "Mock exam answers insert" ON public.attempt_answers;
CREATE POLICY "Mock exam answers insert"
  ON public.attempt_answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.attempts a
      WHERE a.id = attempt_answers.attempt_id
        AND a.user_id IS NULL
        AND a.proctoring_data IS NOT NULL
        AND (a.proctoring_data->>'is_mock')::boolean = true
    )
  );

-- Add RLS policy for reading mock exam answers
DROP POLICY IF EXISTS "Mock exam answers select" ON public.attempt_answers;
CREATE POLICY "Mock exam answers select"
  ON public.attempt_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.attempts a
      WHERE a.id = attempt_answers.attempt_id
        AND a.user_id IS NULL
        AND a.proctoring_data IS NOT NULL
        AND (a.proctoring_data->>'is_mock')::boolean = true
    )
  );

-- Ensure recompute_results_for_attempt allows mock (anonymous) attempts
-- We recreate the function so the permissions include mock attempts
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
  -- Permissions: owner, admin, or anonymous mock
  SELECT EXISTS (
    SELECT 1 FROM public.attempts a
    LEFT JOIN public.users u ON a.user_id = u.id
    WHERE a.id = attempt_uuid
      AND (
        (a.user_id IS NOT NULL AND u.auth_user_id = auth.uid())
        OR (a.user_id IS NULL AND a.proctoring_data->>'is_mock' = 'true')
      )
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
