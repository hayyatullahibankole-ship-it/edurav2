ALTER TABLE public.campus_courses ADD COLUMN IF NOT EXISTS grade TEXT;

CREATE TABLE public.campus_timetable (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID REFERENCES public.campus_courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  day_of_week SMALLINT NOT NULL DEFAULT 1,
  start_time TIME NOT NULL DEFAULT '08:00',
  end_time TIME NOT NULL DEFAULT '10:00',
  venue TEXT,
  lecturer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.campus_timetable TO authenticated;
GRANT ALL ON public.campus_timetable TO service_role;
ALTER TABLE public.campus_timetable ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own timetable" ON public.campus_timetable
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.campus_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID REFERENCES public.campus_courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'assignment',
  due_date DATE,
  is_done BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.campus_tasks TO authenticated;
GRANT ALL ON public.campus_tasks TO service_role;
ALTER TABLE public.campus_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own tasks" ON public.campus_tasks
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_campus_timetable_user ON public.campus_timetable(user_id, day_of_week);
CREATE INDEX idx_campus_tasks_user_due ON public.campus_tasks(user_id, is_done, due_date);

CREATE TRIGGER update_campus_timetable_updated_at BEFORE UPDATE ON public.campus_timetable
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_campus_tasks_updated_at BEFORE UPDATE ON public.campus_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();