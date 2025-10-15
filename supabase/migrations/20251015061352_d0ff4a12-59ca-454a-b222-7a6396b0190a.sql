-- Create lesson completions table
CREATE TABLE IF NOT EXISTS public.lesson_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.study_lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  quiz_score INTEGER,
  quiz_percentage NUMERIC,
  time_spent_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;

-- Users can view own completions
CREATE POLICY "Users can view own lesson completions"
  ON public.lesson_completions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = lesson_completions.user_id
      AND users.auth_user_id = auth.uid()
    )
  );

-- Users can insert own completions
CREATE POLICY "Users can insert own lesson completions"
  ON public.lesson_completions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = lesson_completions.user_id
      AND users.auth_user_id = auth.uid()
    )
  );

-- Admins can view all completions
CREATE POLICY "Admins can view all lesson completions"
  ON public.lesson_completions
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Create index for faster lookups
CREATE INDEX idx_lesson_completions_user_id ON public.lesson_completions(user_id);
CREATE INDEX idx_lesson_completions_lesson_id ON public.lesson_completions(lesson_id);