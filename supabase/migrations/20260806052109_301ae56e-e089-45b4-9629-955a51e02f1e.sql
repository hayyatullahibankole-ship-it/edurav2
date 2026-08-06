CREATE TABLE public.campus_ai_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID REFERENCES public.campus_courses(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.campus_projects(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  prompt TEXT,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campus_ai_sessions TO authenticated;
GRANT ALL ON public.campus_ai_sessions TO service_role;
ALTER TABLE public.campus_ai_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ai sessions" ON public.campus_ai_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_campus_ai_sessions_user ON public.campus_ai_sessions(user_id, created_at DESC);

CREATE TABLE public.campus_question_sets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID REFERENCES public.campus_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  topic TEXT,
  question_type TEXT NOT NULL DEFAULT 'objective',
  difficulty TEXT NOT NULL DEFAULT 'medium',
  question_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campus_question_sets TO authenticated;
GRANT ALL ON public.campus_question_sets TO service_role;
ALTER TABLE public.campus_question_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own question sets" ON public.campus_question_sets FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.campus_generated_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  set_id UUID NOT NULL REFERENCES public.campus_question_sets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  answer TEXT,
  explanation TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campus_generated_questions TO authenticated;
GRANT ALL ON public.campus_generated_questions TO service_role;
ALTER TABLE public.campus_generated_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own generated questions" ON public.campus_generated_questions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_campus_generated_questions_set ON public.campus_generated_questions(set_id, position);

CREATE TABLE public.campus_ai_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  day DATE NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, day)
);
GRANT SELECT ON public.campus_ai_usage TO authenticated;
GRANT ALL ON public.campus_ai_usage TO service_role;
ALTER TABLE public.campus_ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own ai usage" ON public.campus_ai_usage FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_campus_ai_sessions_updated_at BEFORE UPDATE ON public.campus_ai_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_campus_question_sets_updated_at BEFORE UPDATE ON public.campus_question_sets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_campus_ai_usage_updated_at BEFORE UPDATE ON public.campus_ai_usage FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();