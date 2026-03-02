
-- Fix submit_mock_exam to also update registration status and compute JAMB-style results
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
  reg_rec RECORD;
  answer_rec RECORD;
  subject_scores JSONB := '[]'::jsonb;
  strengths TEXT[] := '{}';
  weaknesses TEXT[] := '{}';
  total_converted INT := 0;
  subj RECORD;
  subj_correct INT;
  subj_total INT;
  converted INT;
  reg_id UUID;
  reg_number TEXT;
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

  -- Update registration status to submitted
  UPDATE public.mock_registrations
  SET exam_status = 'submitted', exam_submitted_at = now()
  WHERE id = reg_id;

  -- Get registration record for subjects
  SELECT * INTO reg_rec FROM public.mock_registrations WHERE id = reg_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'success', 'message', 'Exam submitted but registration not found for scoring');
  END IF;

  -- Compute per-subject scores
  FOR subj IN SELECT jsonb_array_elements(reg_rec.subjects) AS subject
  LOOP
    -- Count correct answers for this subject
    SELECT 
      COUNT(*) FILTER (WHERE public.validate_student_answer(aa.question_id, aa.answer)),
      COUNT(*)
    INTO subj_correct, subj_total
    FROM public.attempt_answers aa
    JOIN public.questions q ON q.id = aa.question_id
    WHERE aa.attempt_id = p_attempt_id
      AND q.subject_id = (subj.subject->>'id')::uuid;

    -- Expected questions for this subject
    subj_total := COALESCE((subj.subject->>'questions')::int, 
      CASE WHEN subj.subject->>'name' = 'English Language' THEN 60 ELSE 40 END);

    -- Convert to /100 (JAMB-style)
    converted := CASE WHEN subj_total > 0 THEN ROUND((subj_correct::numeric / subj_total::numeric) * 100) ELSE 0 END;
    total_converted := total_converted + converted;

    subject_scores := subject_scores || jsonb_build_object(
      'subject_name', subj.subject->>'name',
      'subject_id', subj.subject->>'id',
      'correct', subj_correct,
      'total', subj_total,
      'converted_score', converted
    );

    -- Classify as strength or weakness
    IF converted >= 60 THEN
      strengths := array_append(strengths, subj.subject->>'name');
    ELSIF converted < 40 THEN
      weaknesses := array_append(weaknesses, subj.subject->>'name');
    END IF;
  END LOOP;

  -- Insert into mock_results
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

  RETURN jsonb_build_object(
    'status', 'success',
    'message', 'Exam submitted and scored successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('status', 'error', 'message', SQLERRM, 'detail', SQLSTATE);
END;
$$;

-- Add exam_submitted_at column if missing
ALTER TABLE public.mock_registrations ADD COLUMN IF NOT EXISTS exam_submitted_at TIMESTAMPTZ;

-- Ensure mock_results has a unique constraint on registration_id for upsert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'mock_results_registration_id_key'
  ) THEN
    ALTER TABLE public.mock_results ADD CONSTRAINT mock_results_registration_id_key UNIQUE (registration_id);
  END IF;
END $$;

-- Grant execute
GRANT EXECUTE ON FUNCTION public.submit_mock_exam TO authenticated, anon;
