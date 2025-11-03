-- Add school_code column to schools table
ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS school_code VARCHAR(50) UNIQUE;

-- Create function to generate school code from name
CREATE OR REPLACE FUNCTION generate_school_code(school_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_code TEXT;
  final_code TEXT;
  counter INT := 1;
BEGIN
  -- Clean and format school name (remove special chars, lowercase, replace spaces with hyphens)
  base_code := lower(regexp_replace(school_name, '[^a-zA-Z0-9\s]', '', 'g'));
  base_code := regexp_replace(base_code, '\s+', '-', 'g');
  base_code := substring(base_code, 1, 30); -- Limit length
  
  final_code := base_code;
  
  -- Ensure uniqueness by adding counter if needed
  WHILE EXISTS (SELECT 1 FROM public.schools WHERE school_code = final_code) LOOP
    final_code := base_code || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_code;
END;
$$;

-- Update existing schools with generated codes
UPDATE public.schools
SET school_code = generate_school_code(name)
WHERE school_code IS NULL;

-- Make school_code NOT NULL after populating existing records
ALTER TABLE public.schools 
ALTER COLUMN school_code SET NOT NULL;