-- Add RPC functions for student count management
CREATE OR REPLACE FUNCTION increment_students_added(school_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE schools
  SET students_added = students_added + 1
  WHERE id = school_id_param;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_students_added(school_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE schools
  SET students_added = GREATEST(students_added - 1, 0)
  WHERE id = school_id_param;
END;
$$;