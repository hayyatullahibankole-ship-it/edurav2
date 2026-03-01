-- Add policy to allow candidates to insert their own mock results and introduce a secure RPC for submissions

-- allow exam taker (or front-end) to insert a result when they have a corresponding registration in started state
CREATE POLICY "Candidates can insert their own mock results" ON public.mock_results
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.mock_registrations mr
      WHERE mr.id = mock_results.registration_id
        AND mr.registration_number = mock_results.registration_number
        AND mr.exam_status = 'started'
    )
  );

-- ensure admins and school admins still have full control (policies already exist above)

-- rpc to centralize result creation and avoid RLS hiccups from anonymous clients
CREATE OR REPLACE FUNCTION public.submit_mock_result(
  p_registration_number TEXT,
  p_total_score NUMERIC,
  p_max_score NUMERIC,
  p_subject_scores JSONB,
  p_strengths JSONB,
  p_weaknesses JSONB,
  p_batch_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  reg_record RECORD;
  result_id UUID;
BEGIN
  -- locate registration
  SELECT * INTO reg_record
  FROM public.mock_registrations
  WHERE registration_number = p_registration_number;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status','error','message','registration_not_found');
  END IF;

  IF reg_record.exam_status = 'submitted' THEN
    RETURN jsonb_build_object('status','error','message','already_submitted');
  END IF;

  -- insert result (will bypass RLS since security definer)
  INSERT INTO public.mock_results (
    registration_id,
    registration_number,
    total_score,
    max_score,
    subject_scores,
    strengths,
    weaknesses,
    is_released,
    batch_id
  ) VALUES (
    reg_record.id,
    p_registration_number,
    p_total_score,
    p_max_score,
    p_subject_scores,
    p_strengths,
    p_weaknesses,
    false,
    p_batch_id
  ) RETURNING id INTO result_id;

  -- update registration status in same transaction
  UPDATE public.mock_registrations
     SET exam_status = 'submitted',
         exam_submitted_at = now()
   WHERE id = reg_record.id;

  RETURN jsonb_build_object('status','ok','result_id', result_id);
END;
$$;
