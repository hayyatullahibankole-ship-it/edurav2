
-- 1. Create exam_questions junction table to properly link questions to exams
CREATE TABLE IF NOT EXISTS public.exam_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(exam_id, question_id)
);

ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;

-- RLS for exam_questions
CREATE POLICY "Admins can manage exam_questions"
  ON public.exam_questions FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "School admins can manage their exam questions"
  ON public.exam_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.exams e
      WHERE e.id = exam_questions.exam_id
      AND e.school_id IS NOT NULL
      AND is_school_admin(auth.uid(), e.school_id)
    )
  );

CREATE POLICY "Students can view exam questions for assigned exams"
  ON public.exam_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.exams e
      WHERE e.id = exam_questions.exam_id
      AND e.is_published = true
    )
  );

-- Create index on exam_questions
CREATE INDEX idx_exam_questions_exam_id ON public.exam_questions(exam_id);
CREATE INDEX idx_exam_questions_question_id ON public.exam_questions(question_id);

-- 2. Add RLS policies for school admins on questions table
-- Allow school admins to INSERT questions (they become the creator)
CREATE POLICY "School admins can insert questions"
  ON public.questions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.schools s
      JOIN public.users u ON s.admin_user_id = u.id
      WHERE u.auth_user_id = auth.uid()
      AND s.is_active = true
    )
  );

-- Allow school admins to SELECT questions they created
CREATE POLICY "School admins can view their own questions"
  ON public.questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = questions.created_by
      AND u.auth_user_id = auth.uid()
    )
  );

-- Allow school admins to UPDATE questions they created
CREATE POLICY "School admins can update their own questions"
  ON public.questions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = questions.created_by
      AND u.auth_user_id = auth.uid()
    )
  );

-- Allow students to view questions for exams they're assigned to
CREATE POLICY "Students can view questions for their exams"
  ON public.questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.exam_questions eq
      JOIN public.exams e ON eq.exam_id = e.id
      WHERE eq.question_id = questions.id
      AND e.is_published = true
    )
  );

-- 3. Add school admin INSERT policy for exam_subjects
CREATE POLICY "School admins can insert exam subjects"
  ON public.exam_subjects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.exams e
      WHERE e.id = exam_subjects.exam_id
      AND e.school_id IS NOT NULL
      AND is_school_admin(auth.uid(), e.school_id)
    )
  );

-- Allow school admins to view exam subjects for their exams
CREATE POLICY "School admins can view their exam subjects"
  ON public.exam_subjects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.exams e
      WHERE e.id = exam_subjects.exam_id
      AND e.school_id IS NOT NULL
      AND is_school_admin(auth.uid(), e.school_id)
    )
  );
