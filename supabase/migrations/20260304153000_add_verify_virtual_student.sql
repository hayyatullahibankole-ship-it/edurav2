-- Add audit table and RPC to verify virtual students when they start an exam

-- Audit table for verification events
CREATE TABLE IF NOT EXISTS public.mock_verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES public.mock_registrations(id),
  registration_number VARCHAR,
  method VARCHAR,
  attempt_id UUID,
  result VARCHAR,
  reason TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RPC: verify virtual student on exam start
CREATE OR REPLACE FUNCTION public.verify_virtual_student(
  p_reg_number text,
  p_attempt_id uuid DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
  reg public.mock_registrations%ROWTYPE;
  batch_rec public.mock_batches%ROWTYPE;
  outside_window boolean := false;
BEGIN
  SELECT * INTO reg FROM public.mock_registrations WHERE registration_number = p_reg_number LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.mock_verification_logs(registration_number, method, attempt_id, result, reason)
    VALUES (p_reg_number, 'rpc', p_attempt_id, 'failed', 'registration_not_found');
    RETURN jsonb_build_object('ok', false, 'error', 'registration_not_found');
  END IF;

  IF reg.mode <> 'virtual' THEN
    INSERT INTO public.mock_verification_logs(registration_id, registration_number, method, attempt_id, result, reason)
    VALUES (reg.id, p_reg_number, 'rpc', p_attempt_id, 'failed', 'not_a_virtual_registration');
    RETURN jsonb_build_object('ok', false, 'error', 'not_a_virtual_registration');
  END IF;

  IF reg.batch_id IS NOT NULL THEN
    SELECT * INTO batch_rec FROM public.mock_batches WHERE id = reg.batch_id LIMIT 1;
    IF FOUND AND batch_rec.exam_date IS NOT NULL THEN
      -- allow some leeway: start within 2 hours before and up to 6 hours after scheduled time
      IF now() < batch_rec.exam_date - INTERVAL '2 hours' OR now() > batch_rec.exam_date + INTERVAL '6 hours' THEN
        outside_window := true;
      END IF;
    END IF;
  END IF;

  IF outside_window THEN
    INSERT INTO public.mock_verification_logs(registration_id, registration_number, method, attempt_id, result, reason, payload)
    VALUES (reg.id, p_reg_number, 'rpc', p_attempt_id, 'failed', 'outside_exam_window', jsonb_build_object('now', now(), 'exam_date', batch_rec.exam_date));
    RETURN jsonb_build_object('ok', false, 'error', 'outside_exam_window');
  END IF;

  -- Update registration to mark started + verified
  UPDATE public.mock_registrations
  SET verified_present = true,
      verified_at = now(),
      exam_status = 'started',
      exam_started_at = COALESCE(exam_started_at, now()),
      attempt_id = COALESCE(p_attempt_id, attempt_id),
      updated_at = now()
  WHERE id = reg.id;

  INSERT INTO public.mock_verification_logs(registration_id, registration_number, method, attempt_id, result, payload)
  VALUES (reg.id, p_reg_number, 'rpc', p_attempt_id, 'success', jsonb_build_object('verified_at', now()));

  RETURN jsonb_build_object('ok', true, 'registration_id', reg.id, 'verified_at', now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Index to speed up lookups
CREATE INDEX IF NOT EXISTS idx_mock_verification_logs_reg_number ON public.mock_verification_logs(registration_number);
