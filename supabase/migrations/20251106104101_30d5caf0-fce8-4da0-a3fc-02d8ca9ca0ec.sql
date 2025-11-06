-- Improve school code generation to be more professional
-- Format: EDU-YYYY-NNNNNN (e.g., EDU-2025-000123)

CREATE OR REPLACE FUNCTION generate_professional_school_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_year TEXT;
  sequence_num INTEGER;
  new_code TEXT;
  max_attempts INTEGER := 100;
  attempt INTEGER := 0;
BEGIN
  -- Get current year
  current_year := EXTRACT(YEAR FROM NOW())::TEXT;
  
  -- Get the highest sequence number for this year
  SELECT COALESCE(MAX(
    CASE 
      WHEN school_code ~ ('^EDU-' || current_year || '-[0-9]{6}$')
      THEN SUBSTRING(school_code FROM 10)::INTEGER
      ELSE 0
    END
  ), 0) INTO sequence_num
  FROM public.schools;
  
  -- Increment and try to create unique code
  WHILE attempt < max_attempts LOOP
    sequence_num := sequence_num + 1;
    new_code := 'EDU-' || current_year || '-' || LPAD(sequence_num::TEXT, 6, '0');
    
    -- Check if code already exists
    IF NOT EXISTS (SELECT 1 FROM public.schools WHERE school_code = new_code) THEN
      RETURN new_code;
    END IF;
    
    attempt := attempt + 1;
  END LOOP;
  
  -- Fallback: use timestamp-based code if we can't find a unique sequential one
  RETURN 'EDU-' || current_year || '-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$;

-- Update the trigger function to use the new generator
CREATE OR REPLACE FUNCTION auto_generate_school_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only generate if school_code is NULL
  IF NEW.school_code IS NULL THEN
    NEW.school_code := generate_professional_school_code();
  END IF;
  RETURN NEW;
END;
$$;

-- Update existing schools with professional codes (only if they have old format)
DO $$
DECLARE
  school_record RECORD;
BEGIN
  FOR school_record IN 
    SELECT id, school_code 
    FROM public.schools 
    WHERE school_code IS NOT NULL 
    AND school_code !~ '^EDU-[0-9]{4}-[0-9]{6}$'
  LOOP
    UPDATE public.schools
    SET school_code = generate_professional_school_code()
    WHERE id = school_record.id;
  END LOOP;
END $$;