-- Simplify school code to 5-6 alphanumeric characters
-- Format: EDU001, EDU002, etc. (6 chars) or EDUABC (6 chars with letters)

CREATE OR REPLACE FUNCTION generate_professional_school_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sequence_num INTEGER;
  new_code TEXT;
  max_attempts INTEGER := 100;
  attempt INTEGER := 0;
BEGIN
  -- Get the highest sequence number from existing codes
  SELECT COALESCE(MAX(
    CASE 
      WHEN school_code ~ '^EDU[0-9]{3}$'
      THEN SUBSTRING(school_code FROM 4)::INTEGER
      ELSE 0
    END
  ), 0) INTO sequence_num
  FROM public.schools;
  
  -- Increment and try to create unique code
  WHILE attempt < max_attempts LOOP
    sequence_num := sequence_num + 1;
    new_code := 'EDU' || LPAD(sequence_num::TEXT, 3, '0');
    
    -- Check if code already exists
    IF NOT EXISTS (SELECT 1 FROM public.schools WHERE school_code = new_code) THEN
      RETURN new_code;
    END IF;
    
    attempt := attempt + 1;
  END LOOP;
  
  -- Fallback: use random alphanumeric if sequential fails
  LOOP
    new_code := 'EDU' || upper(substring(md5(random()::text) from 1 for 3));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.schools WHERE school_code = new_code);
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Update existing schools with new shorter codes
DO $$
DECLARE
  school_record RECORD;
  counter INTEGER := 0;
BEGIN
  FOR school_record IN 
    SELECT id 
    FROM public.schools 
    ORDER BY created_at
  LOOP
    counter := counter + 1;
    UPDATE public.schools
    SET school_code = 'EDU' || LPAD(counter::TEXT, 3, '0')
    WHERE id = school_record.id;
  END LOOP;
END $$;