-- Fix school exam visibility issue
-- Students should only see published exams or exams with active assignments

-- Drop the old policy
DROP POLICY IF EXISTS "Students can view school assigned exams" ON public.exams;

-- Create new policy that checks is_published for school exams
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
      WHERE sea.exam_id = exams.id
      AND sea.is_active = true
      AND (sea.student_id = u.id OR sea.assigned_to_all = true)
      AND (sea.start_date IS NULL OR sea.start_date <= now())
      AND (sea.end_date IS NULL OR sea.end_date >= now())
    )
  )
  OR
  (is_published = true AND school_id IS NULL)
);

-- Ensure school exams are published by default when created (optional - update data)
-- This helps existing unpublished exams be visible to students
-- UPDATE public.exams SET is_published = true WHERE school_id IS NOT NULL AND is_published = false;
