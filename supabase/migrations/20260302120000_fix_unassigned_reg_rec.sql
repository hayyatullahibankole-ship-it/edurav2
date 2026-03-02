-- Prevent errors when a mock attempt has no associated registration
-- earlier versions of "submit_mock_exam" (and the trigger used by it)
-- declared their registration record variable as a generic RECORD.  if the
-- lookup returned no rows the variable remained unassigned; accessing any
-- field afterwards produced the runtime error ``record "reg_rec" is not
-- assigned yet``.  the frontend saw this as a failed status update.
--
-- This migration redefines both the RPC function and the trigger function
-- to use a concrete rowtype and to guard all uses of the record with
-- FOUND/boolean checks.

-- rpc function ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_mock_exam(
  p_attempt_id UUID
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  attempt_rec RECORD;
  reg_rec public.mock_registrations%ROWTYPE;
  answer_rec RECORD;
  subject_scores JSONB := '[]'::jsonb;
  strengths JSONB := '[]'::jsonb;
  weaknesses JSONB := '[]'::jsonb;
  total_converted INT := 0;
  subj RECORD;
  subj_correct INT;
  subj_total INT;
  converted INT;
  reg_id UUID;
  reg_number TEXT;
  found_reg BOOLEAN := FALSE;
BEGIN
  -- Verify attempt exists and is for a mock exam
  SELECT * INTO attempt_rec FROM public.attempts
  WHERE id = p_attempt_id
    AND user_id IS NULL
    AND proctoring_data IS NOT NULL
    AND (proctoring_data->>'is_mock')::boolean = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Invalid attempt or not a mock exam');
  END IF;

  -- Update attempt status to SUBMITTED
  UPDATE public.attempts
  SET status = 'SUBMITTED', submitted_at = now()
  WHERE id = p_attempt_id;

  -- Get registration info from proctoring_data
  reg_id := (attempt_rec.proctoring_data->>'mock_registration_id')::uuid;
  reg_number := attempt_rec.proctoring_data->>'registration_number';

  -- fetch the registration; leave found_reg flag for later logic
  SELECT * INTO reg_rec FROM public.mock_registrations WHERE id = reg_id;
  found_reg := FOUND;

  IF NOT found_reg THEN
    -- nothing to score; the registration might have been deleted or the
    -- proctoring data was malformed.  still treat the attempt as submitted.
    RETURN jsonb_build_object(
      'status', 'success',
      'message', 'Exam submitted but registration not found for scoring'
    );
  END IF;

  -- Compute per-subject scores (we know reg_rec is initialized here)
  FOR subj IN SELECT jsonb_array_elements(reg_rec.subjects) AS subject
  LOOP
    SELECT 
      COUNT(*) FILTER (WHERE public.validate_student_answer(aa.question_id, aa.answer)),
      COUNT(*)
    INTO subj_correct, subj_total
    FROM public.attempt_answers aa
    JOIN public.questions q ON q.id = aa.question_id
    WHERE aa.attempt_id = p_attempt_id
      AND q.subject_id = (subj.subject->>'id')::uuid;

    subj_total := COALESCE((subj.subject->>'questions')::int, 
      CASE WHEN subj.subject->>'name' = 'English Language' THEN 60 ELSE 40 END);

    converted := CASE WHEN subj_total > 0 THEN ROUND((subj_correct::numeric / subj_total::numeric) * 100) ELSE 0 END;
    total_converted := total_converted + converted;

    subject_scores := subject_scores || jsonb_build_object(
      'subject_name', subj.subject->>'name',
      'subject_id', subj.subject->>'id',
      'correct', subj_correct,
      'total', subj_total,
      'converted_score', converted
    );

    IF converted >= 60 THEN
      strengths := strengths || jsonb_build_array(subj.subject->>'name');
    ELSIF converted < 40 THEN
      weaknesses := weaknesses || jsonb_build_array(subj.subject->>'name');
    END IF;
  END LOOP;

  -- insert/update results
  INSERT INTO public.mock_results (
    registration_id,
    registration_number,
    attempt_id,
    batch_id,
    total_score,
    max_score,
    subject_scores,
    strengths,
    weaknesses,
    is_released
  ) VALUES (
    reg_id,
    reg_number,
    p_attempt_id,
    reg_rec.batch_id,
    total_converted,
    400,
    subject_scores,
    strengths,
    weaknesses,
    false
  )
  ON CONFLICT (registration_id) DO UPDATE SET
    total_score = EXCLUDED.total_score,
    max_score = EXCLUDED.max_score,
    subject_scores = EXCLUDED.subject_scores,
    strengths = EXCLUDED.strengths,
    weaknesses = EXCLUDED.weaknesses,
    attempt_id = EXCLUDED.attempt_id;

  -- update registration status
  UPDATE public.mock_registrations
  SET exam_status = 'submitted', exam_submitted_at = now(), attempt_id = p_attempt_id
  WHERE id = reg_id;

  RETURN jsonb_build_object(
    'status', 'success',
    'message', 'Exam submitted and scored successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('status', 'error', 'message', SQLERRM, 'detail', SQLSTATE);
END;
$$;

-- grant again in case this is a fresh deployment
GRANT EXECUTE ON FUNCTION public.submit_mock_exam TO authenticated, anon;

-- trigger function ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.auto_compute_mock_results()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_data JSONB;
  reg_id UUID;
  reg_number TEXT;
  batch_id UUID;
  subject_scores JSONB := '[]'::jsonb;
  strengths JSONB := '[]'::jsonb;
  weaknesses JSONB := '[]'::jsonb;
  total_converted INT := 0;
  subj RECORD;
  subj_correct INT;
  subj_total INT;
  converted INT;
  reg_rec public.mock_registrations%ROWTYPE;
BEGIN
  IF NEW.status != 'SUBMITTED' OR OLD.status = 'SUBMITTED' THEN
    RETURN NEW;
  END IF;

  IF NEW.user_id IS NULL 
    AND NEW.proctoring_data IS NOT NULL 
    AND (NEW.proctoring_data->>'is_mock')::boolean = true THEN
    
    reg_id := (NEW.proctoring_data->>'mock_registration_id')::uuid;
    reg_number := NEW.proctoring_data->>'registration_number';

    SELECT * INTO reg_rec FROM public.mock_registrations WHERE id = reg_id;

    IF FOUND THEN
      batch_id := reg_rec.batch_id;

      FOR subj IN SELECT jsonb_array_elements(reg_rec.subjects) AS subject
      LOOP
        SELECT 
          COUNT(*) FILTER (WHERE public.validate_student_answer(aa.question_id, aa.answer)),
          COUNT(*)
        INTO subj_correct, subj_total
        FROM public.attempt_answers aa
        JOIN public.questions q ON q.id = aa.question_id
        WHERE aa.attempt_id = NEW.id
          AND q.subject_id = (subj.subject->>'id')::uuid;

        subj_correct := COALESCE(subj_correct, 0);
        subj_total := COALESCE((subj.subject->>'questions')::int, 
          CASE WHEN subj.subject->>'name' = 'English Language' THEN 60 ELSE 40 END);

        converted := CASE WHEN subj_total > 0 THEN ROUND((subj_correct::numeric / subj_total::numeric) * 100) ELSE 0 END;
        total_converted := total_converted + converted;

        subject_scores := subject_scores || jsonb_build_object(
          'subject_name', subj.subject->>'name',
          'subject_id', subj.subject->>'id',
          'correct', subj_correct,
          'total', subj_total,
          'converted_score', converted
        );

        IF converted >= 60 THEN
          strengths := strengths || jsonb_build_array(subj.subject->>'name');
        ELSIF converted < 40 THEN
          weaknesses := weaknesses || jsonb_build_array(subj.subject->>'name');
        END IF;
      END LOOP;

      INSERT INTO public.mock_results (
        registration_id,
        registration_number,
        attempt_id,
        batch_id,
        total_score,
        max_score,
        subject_scores,
        strengths,
        weaknesses,
        is_released
      ) VALUES (
        reg_id,
        reg_number,
        NEW.id,
        batch_id,
        total_converted,
        400,
        subject_scores,
        strengths,
        weaknesses,
        false
      )
      ON CONFLICT (registration_id) DO UPDATE SET
        total_score = EXCLUDED.total_score,
        max_score = EXCLUDED.max_score,
        subject_scores = EXCLUDED.subject_scores,
        strengths = EXCLUDED.strengths,
        weaknesses = EXCLUDED.weaknesses,
        attempt_id = EXCLUDED.attempt_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
