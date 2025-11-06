-- Update school code generation to use format: XXX-YY-NNN
-- XXX = First 3 letters from school name (uppercase)
-- YY = Current year (last 2 digits)
-- NNN = Sequential 3-digit number

CREATE OR REPLACE FUNCTION generate_school_code_from_name(school_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  name_prefix TEXT;
  current_year TEXT;
  max_number INTEGER;
  counter INTEGER := 1;
  new_code TEXT;
BEGIN
  -- Extract first 3 letters from school name (alphanumeric only, uppercase)
  name_prefix := UPPER(REGEXP_REPLACE(school_name, '[^A-Za-z]', '', 'g'));
  name_prefix := SUBSTRING(name_prefix FROM 1 FOR 3);
  
  -- Pad with 'X' if less than 3 letters
  WHILE LENGTH(name_prefix) < 3 LOOP
    name_prefix := name_prefix || 'X';
  END LOOP;
  
  -- Get current year (last 2 digits)
  current_year := TO_CHAR(CURRENT_DATE, 'YY');
  
  -- Find the highest number used with this prefix and year
  SELECT COALESCE(MAX(
    CASE 
      WHEN school_code ~ ('^' || name_prefix || '-' || current_year || '-[0-9]{3}$')
      THEN SUBSTRING(school_code FROM LENGTH(name_prefix) + LENGTH(current_year) + 3)::INTEGER
      ELSE 0
    END
  ), 0) INTO max_number
  FROM public.schools;
  
  -- Generate new code with incremented number
  counter := max_number + 1;
  
  -- Try to generate unique code (with fallback)
  FOR i IN 1..100 LOOP
    new_code := name_prefix || '-' || current_year || '-' || LPAD(counter::TEXT, 3, '0');
    
    -- Check if code already exists
    IF NOT EXISTS (SELECT 1 FROM public.schools WHERE school_code = new_code) THEN
      RETURN new_code;
    END IF;
    
    counter := counter + 1;
  END LOOP;
  
  -- Fallback: use random 6-char suffix if all attempts failed
  LOOP
    new_code := name_prefix || '-' || current_year || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 3));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.schools WHERE school_code = new_code);
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Update trigger function to use name-based generator
CREATE OR REPLACE FUNCTION auto_generate_school_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only generate if school_code is NULL
  IF NEW.school_code IS NULL THEN
    NEW.school_code := generate_school_code_from_name(NEW.name);
  END IF;
  RETURN NEW;
END;
$$;

-- Update existing school codes to new format
DO $$
DECLARE
  school_record RECORD;
BEGIN
  FOR school_record IN 
    SELECT id, name, school_code 
    FROM public.schools 
    WHERE school_code IS NOT NULL 
    AND school_code !~ '^[A-Z]{3}-[0-9]{2}-[0-9]{3}$'
  LOOP
    UPDATE public.schools
    SET school_code = generate_school_code_from_name(school_record.name)
    WHERE id = school_record.id;
  END LOOP;
END $$;