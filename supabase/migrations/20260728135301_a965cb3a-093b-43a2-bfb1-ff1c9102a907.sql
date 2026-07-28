-- EBOOKS
CREATE TABLE public.ebooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  author text NOT NULL DEFAULT 'AKBOY',
  description text,
  cover_url text,
  brand text NOT NULL DEFAULT 'akboy',
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ebooks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ebooks TO authenticated;
GRANT ALL ON public.ebooks TO service_role;
ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.ebook_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ebook_id uuid NOT NULL REFERENCES public.ebooks(id) ON DELETE CASCADE,
  chapter_number integer NOT NULL DEFAULT 1,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  is_preview boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ebook_id, chapter_number)
);
GRANT SELECT ON public.ebook_chapters TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ebook_chapters TO authenticated;
GRANT ALL ON public.ebook_chapters TO service_role;
ALTER TABLE public.ebook_chapters ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.ebook_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ebook_id uuid NOT NULL REFERENCES public.ebooks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  granted_by uuid,
  source text NOT NULL DEFAULT 'admin',
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ebook_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ebook_access TO authenticated;
GRANT ALL ON public.ebook_access TO service_role;
ALTER TABLE public.ebook_access ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.ebook_access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ebook_id uuid NOT NULL REFERENCES public.ebooks(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  max_uses integer NOT NULL DEFAULT 1,
  used_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ebook_access_codes TO authenticated;
GRANT ALL ON public.ebook_access_codes TO service_role;
ALTER TABLE public.ebook_access_codes ENABLE ROW LEVEL SECURITY;

-- helper functions
CREATE OR REPLACE FUNCTION public.is_ebook_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'admin'::app_role) OR public.has_role(_user_id, 'super_admin'::app_role)
$$;

CREATE OR REPLACE FUNCTION public.has_ebook_access(_ebook_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.ebook_access a
    WHERE a.ebook_id = _ebook_id AND a.user_id = _user_id
      AND (a.expires_at IS NULL OR a.expires_at > now())
  ) OR public.is_ebook_admin(_user_id)
$$;

-- POLICIES
CREATE POLICY "Published ebooks are viewable" ON public.ebooks
  FOR SELECT USING (is_published OR public.is_ebook_admin(auth.uid()));
CREATE POLICY "Admins manage ebooks" ON public.ebooks
  FOR ALL TO authenticated USING (public.is_ebook_admin(auth.uid())) WITH CHECK (public.is_ebook_admin(auth.uid()));

CREATE POLICY "Chapters readable by granted readers" ON public.ebook_chapters
  FOR SELECT USING (
    is_preview
    OR public.has_ebook_access(ebook_id, auth.uid())
  );
CREATE POLICY "Admins manage chapters" ON public.ebook_chapters
  FOR ALL TO authenticated USING (public.is_ebook_admin(auth.uid())) WITH CHECK (public.is_ebook_admin(auth.uid()));

CREATE POLICY "Users view own ebook access" ON public.ebook_access
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_ebook_admin(auth.uid()));
CREATE POLICY "Admins manage ebook access" ON public.ebook_access
  FOR ALL TO authenticated USING (public.is_ebook_admin(auth.uid())) WITH CHECK (public.is_ebook_admin(auth.uid()));

CREATE POLICY "Admins manage access codes" ON public.ebook_access_codes
  FOR ALL TO authenticated USING (public.is_ebook_admin(auth.uid())) WITH CHECK (public.is_ebook_admin(auth.uid()));

-- redeem function
CREATE OR REPLACE FUNCTION public.redeem_ebook_code(_code text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_row public.ebook_access_codes%ROWTYPE;
  v_slug text;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'You must be signed in.');
  END IF;

  SELECT * INTO v_row FROM public.ebook_access_codes
   WHERE upper(code) = upper(trim(_code)) FOR UPDATE;

  IF NOT FOUND OR NOT v_row.is_active THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid access code.');
  END IF;
  IF v_row.expires_at IS NOT NULL AND v_row.expires_at <= now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'This access code has expired.');
  END IF;
  IF v_row.used_count >= v_row.max_uses THEN
    RETURN jsonb_build_object('success', false, 'error', 'This access code has reached its usage limit.');
  END IF;

  INSERT INTO public.ebook_access (ebook_id, user_id, source)
  VALUES (v_row.ebook_id, v_uid, 'code')
  ON CONFLICT (ebook_id, user_id) DO NOTHING;

  UPDATE public.ebook_access_codes SET used_count = used_count + 1 WHERE id = v_row.id;

  SELECT slug INTO v_slug FROM public.ebooks WHERE id = v_row.ebook_id;
  RETURN jsonb_build_object('success', true, 'ebook_id', v_row.ebook_id, 'slug', v_slug);
END;
$$;

-- updated_at triggers
CREATE TRIGGER update_ebooks_updated_at BEFORE UPDATE ON public.ebooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ebook_chapters_updated_at BEFORE UPDATE ON public.ebook_chapters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_ebook_chapters_book ON public.ebook_chapters(ebook_id, chapter_number);
CREATE INDEX idx_ebook_access_user ON public.ebook_access(user_id);