
CREATE TABLE public.waec_mock_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  grade TEXT NOT NULL,
  remark TEXT NOT NULL,
  exam_year TEXT NOT NULL DEFAULT '2026 MOCK',
  school_name TEXT NOT NULL DEFAULT 'AL-BARI COLLEGE',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, subject, exam_year)
);

CREATE TABLE public.waec_result_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  result_published BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

INSERT INTO public.waec_result_settings (result_published) VALUES (false);

ALTER TABLE public.waec_mock_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waec_result_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students view own waec results"
  ON public.waec_mock_results FOR SELECT TO authenticated
  USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Admins manage waec results"
  ON public.waec_mock_results FOR ALL TO authenticated
  USING (public.has_role((SELECT id FROM public.users WHERE auth_user_id = auth.uid()), 'admin'))
  WITH CHECK (public.has_role((SELECT id FROM public.users WHERE auth_user_id = auth.uid()), 'admin'));

CREATE POLICY "Read waec settings"
  ON public.waec_result_settings FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin update waec settings"
  ON public.waec_result_settings FOR UPDATE TO authenticated
  USING (public.has_role((SELECT id FROM public.users WHERE auth_user_id = auth.uid()), 'admin'))
  WITH CHECK (public.has_role((SELECT id FROM public.users WHERE auth_user_id = auth.uid()), 'admin'));
