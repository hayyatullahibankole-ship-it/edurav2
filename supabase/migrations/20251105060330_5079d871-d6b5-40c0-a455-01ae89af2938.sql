-- Add school_id to exams table to support school-created exams
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;

-- Create index for faster school exam queries
CREATE INDEX IF NOT EXISTS idx_exams_school_id ON public.exams(school_id);

-- Create school_exam_assignments table to track which students can access which exams
CREATE TABLE IF NOT EXISTS public.school_exam_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  assigned_to_all BOOLEAN DEFAULT false,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES public.users(id),
  CONSTRAINT unique_exam_student UNIQUE(exam_id, student_id)
);

-- Enable RLS on school_exam_assignments
ALTER TABLE public.school_exam_assignments ENABLE ROW LEVEL SECURITY;

-- Policy: School admins can manage their school's exam assignments
CREATE POLICY "School admins can manage exam assignments"
ON public.school_exam_assignments
FOR ALL
USING (is_school_admin(auth.uid(), school_id));

-- Policy: Students can view exams assigned to them
CREATE POLICY "Students can view their assigned exams"
ON public.school_exam_assignments
FOR SELECT
USING (
  (student_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = school_exam_assignments.student_id 
    AND u.auth_user_id = auth.uid()
  ))
  OR
  (assigned_to_all = true AND EXISTS (
    SELECT 1 FROM public.school_students ss
    JOIN public.users u ON ss.user_id = u.id
    WHERE ss.school_id = school_exam_assignments.school_id
    AND u.auth_user_id = auth.uid()
  ))
);

-- Policy: School admins can create and manage their school's exams
CREATE POLICY "School admins can manage their exams"
ON public.exams
FOR ALL
USING (
  school_id IS NOT NULL 
  AND is_school_admin(auth.uid(), school_id)
);

-- Policy: Students can view exams assigned to their school
CREATE POLICY "Students can view school assigned exams"
ON public.exams
FOR SELECT
USING (
  (school_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.school_exam_assignments sea
    JOIN public.users u ON u.auth_user_id = auth.uid()
    WHERE sea.exam_id = exams.id
    AND sea.is_active = true
    AND (sea.student_id = u.id OR sea.assigned_to_all = true)
    AND (sea.start_date IS NULL OR sea.start_date <= now())
    AND (sea.end_date IS NULL OR sea.end_date >= now())
  ))
  OR
  (is_published = true AND school_id IS NULL)
);