-- Ensure wrapper RPC exists with correct signature
DROP FUNCTION IF EXISTS recompute_results_for_attempt(uuid);

CREATE OR REPLACE FUNCTION recompute_results_for_attempt(attempt_uuid uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller uuid;
  allowed boolean;
  new_result_id uuid;
BEGIN
  caller := auth.uid();
  IF caller IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM attempts a
    JOIN users u ON a.user_id = u.id
    WHERE a.id = attempt_uuid AND u.auth_user_id = caller
  ) INTO allowed;

  IF NOT allowed THEN
    RAISE EXCEPTION 'Not authorized to recompute this attempt';
  END IF;

  new_result_id := compute_exam_results(attempt_uuid);
  RETURN new_result_id;
END;
$$;

-- Helpful index for faster aggregation
CREATE INDEX IF NOT EXISTS idx_attempt_answers_attempt_id ON attempt_answers(attempt_id);
