-- Create trigger to auto-compute results on submission
CREATE OR REPLACE FUNCTION public.auto_compute_results_on_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only trigger when status changes to SUBMITTED
  IF NEW.status = 'SUBMITTED' AND (OLD.status IS NULL OR OLD.status != 'SUBMITTED') THEN
    -- Call the recompute function asynchronously using pg_background if available
    -- Otherwise compute synchronously
    PERFORM public.recompute_results_for_attempt(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_auto_compute_results ON public.attempts;

CREATE TRIGGER trigger_auto_compute_results
  AFTER UPDATE ON public.attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_compute_results_on_submission();

-- Add index to speed up results lookup by attempt_id
CREATE INDEX IF NOT EXISTS idx_results_attempt_id ON public.results(attempt_id);

-- Add index to speed up attempt_answers queries
CREATE INDEX IF NOT EXISTS idx_attempt_answers_attempt_id ON public.attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_attempt_answers_is_correct ON public.attempt_answers(is_correct) WHERE is_correct IS NOT NULL;