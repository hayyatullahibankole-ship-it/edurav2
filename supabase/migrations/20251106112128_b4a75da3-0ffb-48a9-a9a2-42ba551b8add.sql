-- Update school code generation to format: EDU-YY-XXN
-- EDU = Fixed prefix
-- YY = Current year (last 2 digits)
-- XX = 2-3 letters from school name (uppercase)
-- N = Sequential number

CREATE OR REPLACE FUNCTION generate_school_code_from_name(school_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  name_letters TEXT;
  current_year TEXT;
  max_number INTEGER;
  counter INTEGER := 1;
  new_code TEXT;
  letter_count INTEGER;
BEGIN
  -- Extract letters from school name (alphanumeric only, uppercase)
  name_letters := UPPER(REGEXP_REPLACE(school_name, '[^A-Za-z]', '', 'g'));
  
  -- Randomly choose 2 or 3 letters
  letter_count := 2 + (RANDOM() * 2)::INTEGER; -- Random 2 or 3
  
  IF LENGTH(name_letters) >= letter_count THEN
    -- Pick random letters from the school name
    DECLARE
      letter_array TEXT[];
      picked_letters TEXT := '';
      used_positions INTEGER[] := '{}';
      random_pos INTEGER;
    BEGIN
      letter_array := STRING_TO_ARRAY(name_letters, NULL);
      
      -- Pick unique random positions
      FOR i IN 1..letter_count LOOP
        LOOP
          random_pos := 1 + (RANDOM() * (LENGTH(name_letters) - 1))::INTEGER;
          EXIT WHEN NOT (random_pos = ANY(used_positions));
        END LOOP;
        used_positions := array_append(used_positions, random_pos);
        picked_letters := picked_letters || letter_array[random_pos];
      END LOOP;
      
      name_letters := picked_letters;
    END;
  ELSIF LENGTH(name_letters) > 0 THEN
    -- Use all available letters if less than required
    name_letters := SUBSTRING(name_letters FROM 1 FOR LENGTH(name_letters));
  ELSE
    -- Fallback to 'XX' if no letters
    name_letters := 'XX';
  END IF;
  
  -- Get current year (last 2 digits)
  current_year := TO_CHAR(CURRENT_DATE, 'YY');
  
  -- Find the highest number used with this prefix and year
  SELECT COALESCE(MAX(
    CASE 
      WHEN school_code ~ ('^EDU-' || current_year || '-[A-Z]{2,3}[0-9]+$')
      THEN REGEXP_REPLACE(
        SUBSTRING(school_code FROM '^EDU-' || current_year || '-[A-Z]{2,3}([0-9]+)$'),
        '[^0-9]', '', 'g'
      )::INTEGER
      ELSE 0
    END
  ), 0) INTO max_number
  FROM public.schools;
  
  -- Generate new code with incremented number
  counter := max_number + 1;
  
  -- Try to generate unique code (with fallback)
  FOR i IN 1..100 LOOP
    new_code := 'EDU-' || current_year || '-' || name_letters || LPAD(counter::TEXT, 3, '0');
    
    -- Check if code already exists
    IF NOT EXISTS (SELECT 1 FROM public.schools WHERE school_code = new_code) THEN
      RETURN new_code;
    END IF;
    
    counter := counter + 1;
  END LOOP;
  
  -- Fallback: use random letters with timestamp
  new_code := 'EDU-' || current_year || '-' || 
              UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 2)) || 
              LPAD((EXTRACT(EPOCH FROM NOW())::BIGINT % 1000)::TEXT, 3, '0');
  
  RETURN new_code;
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
    AND school_code !~ '^EDU-[0-9]{2}-[A-Z]{2,3}[0-9]{3}$'
  LOOP
    UPDATE public.schools
    SET school_code = generate_school_code_from_name(school_record.name)
    WHERE id = school_record.id;
  END LOOP;
END $$;