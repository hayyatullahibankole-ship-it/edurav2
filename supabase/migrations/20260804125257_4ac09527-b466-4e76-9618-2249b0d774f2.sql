ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS academic_stage TEXT,
  ADD COLUMN IF NOT EXISTS previous_stage TEXT,
  ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS institution_name TEXT,
  ADD COLUMN IF NOT EXISTS faculty TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS study_level TEXT,
  ADD COLUMN IF NOT EXISTS matric_number TEXT;

-- COURSES
CREATE TABLE IF NOT EXISTS public.campus_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  units INTEGER NOT NULL DEFAULT 2,
  semester TEXT NOT NULL DEFAULT 'first',
  session TEXT,
  lecturer TEXT,
  color TEXT NOT NULL DEFAULT 'emerald',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campus_courses TO authenticated;
GRANT ALL ON public.campus_courses TO service_role;
ALTER TABLE public.campus_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own courses" ON public.campus_courses
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all courses" ON public.campus_courses
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE INDEX IF NOT EXISTS idx_campus_courses_user ON public.campus_courses(user_id);

-- MATERIALS
CREATE TABLE IF NOT EXISTS public.campus_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  course_id UUID REFERENCES public.campus_courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  kind TEXT NOT NULL DEFAULT 'note',
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
  department TEXT,
  course_code TEXT,
  level TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  is_library BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campus_materials TO authenticated;
GRANT ALL ON public.campus_materials TO service_role;
ALTER TABLE public.campus_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own materials" ON public.campus_materials
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone signed in reads published library" ON public.campus_materials
  FOR SELECT TO authenticated USING (is_library = true AND is_published = true);
CREATE POLICY "Admins manage materials" ON public.campus_materials
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE INDEX IF NOT EXISTS idx_campus_materials_user ON public.campus_materials(user_id);
CREATE INDEX IF NOT EXISTS idx_campus_materials_library ON public.campus_materials(is_library, is_published);

-- PROJECTS
CREATE TABLE IF NOT EXISTS public.campus_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  topic TEXT,
  supervisor TEXT,
  department TEXT,
  stage TEXT NOT NULL DEFAULT 'proposal',
  deadline DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campus_projects TO authenticated;
GRANT ALL ON public.campus_projects TO service_role;
ALTER TABLE public.campus_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own projects" ON public.campus_projects
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_campus_projects_user ON public.campus_projects(user_id);

-- MILESTONES
CREATE TABLE IF NOT EXISTS public.campus_project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.campus_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  due_date DATE,
  is_done BOOLEAN NOT NULL DEFAULT false,
  supervisor_feedback TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campus_project_milestones TO authenticated;
GRANT ALL ON public.campus_project_milestones TO service_role;
ALTER TABLE public.campus_project_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own milestones" ON public.campus_project_milestones
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_campus_milestones_project ON public.campus_project_milestones(project_id);

-- OPPORTUNITIES
CREATE TABLE IF NOT EXISTS public.campus_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'scholarship',
  organisation TEXT,
  summary TEXT,
  body TEXT,
  image_url TEXT,
  external_url TEXT,
  location TEXT,
  field TEXT,
  level TEXT,
  amount TEXT,
  deadline DATE,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.campus_opportunities TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campus_opportunities TO authenticated;
GRANT ALL ON public.campus_opportunities TO service_role;
ALTER TABLE public.campus_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published opportunities are public" ON public.campus_opportunities
  FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage opportunities" ON public.campus_opportunities
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE INDEX IF NOT EXISTS idx_campus_opps_published ON public.campus_opportunities(is_published, deadline);

-- updated_at triggers
CREATE TRIGGER trg_campus_courses_updated BEFORE UPDATE ON public.campus_courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_campus_materials_updated BEFORE UPDATE ON public.campus_materials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_campus_projects_updated BEFORE UPDATE ON public.campus_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_campus_milestones_updated BEFORE UPDATE ON public.campus_project_milestones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_campus_opportunities_updated BEFORE UPDATE ON public.campus_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();