-- public function to fetch a registration by number for admit slip reprints
-- this RPC is security definer so that anonymous visitors can look up
-- a registration without needing broad select rights on the table. it also
-- joins the batch so the frontend gets everything it needs in one call.

CREATE OR REPLACE FUNCTION public.get_registration_for_admit(
  p_registration_number TEXT
)
RETURNS TABLE (
  id UUID,
  registration_number TEXT,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  subjects JSONB,
  mode TEXT,
  batch_id UUID,
  exam_status TEXT,
  exam_started_at TIMESTAMP WITH TIME ZONE,
  exam_submitted_at TIMESTAMP WITH TIME ZONE,
  batch JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.registration_number,
    r.full_name,
    r.phone,
    r.email,
    r.subjects,
    r.mode,
    r.batch_id,
    r.exam_status,
    r.exam_started_at,
    r.exam_submitted_at,
    json_build_object(
      'id', b.id,
      'title', b.title,
      'exam_date', b.exam_date,
      'exam_venue', b.exam_venue,
      'is_active', b.is_active
    ) AS batch
  FROM public.mock_registrations r
  LEFT JOIN public.mock_batches b ON r.batch_id = b.id
  WHERE r.registration_number = p_registration_number;
END;
$$;
$$;
