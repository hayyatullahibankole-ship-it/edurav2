-- Add missing columns to school_students table
ALTER TABLE public.school_students
ADD COLUMN IF NOT EXISTS student_username VARCHAR(100) UNIQUE,
ADD COLUMN IF NOT EXISTS student_password_hash TEXT,
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);

-- Update increment_students_added function with search_path
CREATE OR REPLACE FUNCTION public.increment_students_added(school_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE schools
  SET students_added = students_added + 1
  WHERE id = school_id_param;
END;
$$;

-- Update decrement_students_added function with search_path
CREATE OR REPLACE FUNCTION public.decrement_students_added(school_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE schools
  SET students_added = GREATEST(students_added - 1, 0)
  WHERE id = school_id_param;
END;
$$;