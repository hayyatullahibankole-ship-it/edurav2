-- Create trigger to auto-generate school_code on insert if not provided
CREATE OR REPLACE FUNCTION auto_generate_school_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only generate if school_code is NULL
  IF NEW.school_code IS NULL THEN
    NEW.school_code := generate_school_code(NEW.name);
  END IF;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_auto_generate_school_code ON public.schools;

-- Create trigger
CREATE TRIGGER trigger_auto_generate_school_code
BEFORE INSERT ON public.schools
FOR EACH ROW
EXECUTE FUNCTION auto_generate_school_code();