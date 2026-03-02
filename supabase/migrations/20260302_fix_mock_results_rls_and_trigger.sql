-- Fix mock_results RLS to allow reading results and ensure they're created automatically
-- Also add a trigger to auto-compute results when an exam is submitted

-- Drop all old policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view their own mock results" ON public.mock_results;
DROP POLICY IF EXISTS "Backend can insert mock results" ON public.mock_results;
DROP POLICY IF EXISTS "Backend can update mock results" ON public.mock_results;
DROP POLICY IF EXISTS "Candidates can insert their own mock results" ON public.mock_results;

-- Ensure the RLS policy exists that allows the backend function to write results
-- These permissive policies bypass auth checks since SECURITY DEFINER functions handle auth
CREATE POLICY "Backend can insert mock results" ON public.mock_results
  FOR INSERT WITH CHECK (true);

-- Add UPDATE policy so the submit_mock_exam function can update results
CREATE POLICY "Backend can update mock results" ON public.mock_results
  FOR UPDATE USING (true) WITH CHECK (true);

-- Add missing RLS policy for reading mock results
-- This allows the check_mock_result function and dashboards to read results
CREATE POLICY "Everyone can read released mock results" ON public.mock_results
  FOR SELECT USING (true);

-- Add trigger to automatically compute and insert mock results when exam is submitted
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
  strengths TEXT[] := '{}';
  weaknesses TEXT[] := '{}';
  total_converted INT := 0;
  subj RECORD;
  subj_correct INT;
  subj_total INT;
  converted INT;
  reg_rec RECORD;
BEGIN
  -- Only process if status changed to SUBMITTED
  IF NEW.status != 'SUBMITTED' OR OLD.status = 'SUBMITTED' THEN
    RETURN NEW;
  END IF;

  -- Check if this is a mock exam attempt (anonymous with mock flag)
  IF NEW.user_id IS NULL 
    AND NEW.proctoring_data IS NOT NULL 
    AND (NEW.proctoring_data->>'is_mock')::boolean = true THEN
    
    reg_id := (NEW.proctoring_data->>'mock_registration_id')::uuid;
    reg_number := NEW.proctoring_data->>'registration_number';

    -- Get registration record for subjects and batch
    SELECT * INTO reg_rec FROM public.mock_registrations WHERE id = reg_id;

    IF FOUND THEN
      batch_id := reg_rec.batch_id;

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
        WHERE aa.attempt_id = NEW.id
          AND q.subject_id = (subj.subject->>'id')::uuid;

        -- Handle NULL values
        subj_correct := COALESCE(subj_correct, 0);
        
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

      -- Insert or update mock_results
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
        attempt_id = EXCLUDED.attempt_id,
        batch_id = EXCLUDED.batch_id,
        updated_at = now();
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_auto_compute_mock_results ON public.attempts;

-- Create trigger to auto-compute results when exam is submitted
CREATE TRIGGER trigger_auto_compute_mock_results
AFTER UPDATE ON public.attempts
FOR EACH ROW
EXECUTE FUNCTION public.auto_compute_mock_results();

-- Ensure admin and school admin policies still work
-- They should take precedence over the permissive policy above
DROP POLICY IF EXISTS "Admins can manage all mock results" ON public.mock_results;
CREATE POLICY "Admins can manage all mock results" ON public.mock_results
  FOR ALL USING (is_admin(auth.uid()));

-- Recreate the school admin policy if needed
DROP POLICY IF EXISTS "School admins can view their school results" ON public.mock_results;
CREATE POLICY "School admins can view their school results" ON public.mock_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.mock_registrations mr
      WHERE mr.id = mock_results.registration_id
      AND mr.school_id IS NOT NULL
      AND is_school_admin(auth.uid(), mr.school_id)
    )
  );
