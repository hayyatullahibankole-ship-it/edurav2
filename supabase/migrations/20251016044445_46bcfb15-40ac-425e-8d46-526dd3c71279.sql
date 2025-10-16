-- Fix search_path for the auto_compute function
CREATE OR REPLACE FUNCTION public.auto_compute_results_on_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only trigger when status changes to SUBMITTED
  IF NEW.status = 'SUBMITTED' AND (OLD.status IS NULL OR OLD.status != 'SUBMITTED') THEN
    PERFORM public.recompute_results_for_attempt(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;