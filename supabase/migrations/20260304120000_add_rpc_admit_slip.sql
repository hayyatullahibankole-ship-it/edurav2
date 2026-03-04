-- public function to fetch a registration by number for admit slip reprints
-- this RPC is security definer so that anonymous visitors can look up
-- a registration without needing broad select rights on the table. it also
-- joins the batch so the frontend gets everything it needs in one call.

DROP FUNCTION IF EXISTS public.get_registration_for_admit(text);

CREATE OR REPLACE FUNCTION public.get_registration_for_admit(
  p_registration_number TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', r.id,
    'registration_number', r.registration_number,
    'full_name', r.full_name,
    'phone', r.phone,
    'email', r.email,
    'subjects', r.subjects,
    'mode', r.mode,
    'batch_id', r.batch_id,
    'exam_status', r.exam_status,
    'exam_started_at', r.exam_started_at,
    'exam_submitted_at', r.exam_submitted_at,
    'batch', json_build_object(
      'id', b.id,
      'title', b.title,
      'exam_date', b.exam_date,
      'exam_venue', b.exam_venue,
      'is_active', b.is_active
    )
  ) INTO result
  FROM public.mock_registrations r
  LEFT JOIN public.mock_batches b ON r.batch_id = b.id
  WHERE r.registration_number = p_registration_number;

  RETURN result;
END;
$$;
