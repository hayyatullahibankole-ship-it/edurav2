-- Add department field to school_students table
ALTER TABLE public.school_students 
ADD COLUMN IF NOT EXISTS department VARCHAR(50);

-- Add comment for clarity
COMMENT ON COLUMN public.school_students.department IS 'Department/Stream: Science, Arts, Commercial, or other';

-- Create index for department queries
CREATE INDEX IF NOT EXISTS idx_school_students_department 
ON public.school_students(school_id, department);

-- Add target_departments field to exams table (jsonb array)
ALTER TABLE public.exams 
ADD COLUMN IF NOT EXISTS target_departments JSONB DEFAULT '[]'::jsonb;

-- Add comment for clarity
COMMENT ON COLUMN public.exams.target_departments IS 'Array of departments this exam targets: ["Science", "Arts", "Commercial"]. Empty array means all departments.';

-- Create index for target_departments queries
CREATE INDEX IF NOT EXISTS idx_exams_target_departments 
ON public.exams USING GIN (target_departments);

-- Update RLS policy for school exams to include department check
DROP POLICY IF EXISTS "Students can view school assigned exams" ON public.exams;

CREATE POLICY "Students can view school assigned exams"
ON public.exams
FOR SELECT
USING (
  (
    school_id IS NOT NULL 
    AND is_published = true 
    AND EXISTS (
      SELECT 1 FROM public.school_exam_assignments sea
      JOIN public.users u ON u.auth_user_id = auth.uid()
      JOIN public.school_students ss ON ss.user_id = u.id AND ss.school_id = sea.school_id
      WHERE sea.exam_id = exams.id
      AND sea.is_active = true
      AND (sea.student_id = u.id OR sea.assigned_to_all = true)
      AND (sea.start_date IS NULL OR sea.start_date <= now())
      AND (sea.end_date IS NULL OR sea.end_date >= now())
      AND (
        -- Department check: if exam has target departments, student's department must be in the list
        -- If exam has no target departments, it's visible to all
        COALESCE(jsonb_array_length(exams.target_departments), 0) = 0
        OR ss.department IS NULL
        OR exams.target_departments @> jsonb_build_array(ss.department)
      )
    )
  )
  OR
  (is_published = true AND school_id IS NULL)
);

-- Add helpful function to check if a student can see an exam
CREATE OR REPLACE FUNCTION can_student_view_exam(
  p_student_id UUID,
  p_school_id UUID,
  p_exam_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_has_assignment BOOLEAN;
  v_student_department VARCHAR;
  v_exam_target_depts JSONB;
BEGIN
  -- Check if student has valid assignment
  SELECT EXISTS(
    SELECT 1 FROM school_exam_assignments
    WHERE exam_id = p_exam_id
    AND school_id = p_school_id
    AND (student_id = p_student_id OR assigned_to_all = true)
    AND is_active = true
    AND (start_date IS NULL OR start_date <= now())
    AND (end_date IS NULL OR end_date >= now())
  ) INTO v_has_assignment;

  IF NOT v_has_assignment THEN
    RETURN false;
  END IF;

  -- Get student's department
  SELECT department INTO v_student_department
  FROM school_students
  WHERE user_id = p_student_id AND school_id = p_school_id;

  -- Get exam's target departments
  SELECT target_departments INTO v_exam_target_depts
  FROM exams
  WHERE id = p_exam_id;

  -- If exam has no target departments, it's for everyone
  IF COALESCE(jsonb_array_length(v_exam_target_depts), 0) = 0 THEN
    RETURN true;
  END IF;

  -- If student has no department, they can't see targeted exams
  IF v_student_department IS NULL THEN
    RETURN false;
  END IF;

  -- Check if student's department is in exam's target departments
  RETURN v_exam_target_depts @> jsonb_build_array(v_student_department);
END;
$$ LANGUAGE plpgsql STABLE;
