CREATE TABLE public.institutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  short_code TEXT,
  type TEXT NOT NULL DEFAULT 'university',
  state TEXT,
  form_fee NUMERIC NOT NULL DEFAULT 0,
  service_fee_override NUMERIC,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX institutions_name_unique ON public.institutions (lower(name));
CREATE INDEX institutions_active_idx ON public.institutions (is_active, name);

GRANT SELECT ON public.institutions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.institutions TO authenticated;
GRANT ALL ON public.institutions TO service_role;

ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active institutions"
ON public.institutions FOR SELECT
USING (is_active = true OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage institutions"
ON public.institutions FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.institution_service_fee(_form_fee NUMERIC)
RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN COALESCE(_form_fee, 0) <= 5000 THEN 3000
    WHEN _form_fee < 10000 THEN 4000
    ELSE 5000
  END::numeric;
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at_institutions()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER institutions_set_updated_at
BEFORE UPDATE ON public.institutions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_institutions();

ALTER TABLE public.service_requests
  ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS institution_name TEXT,
  ADD COLUMN IF NOT EXISTS form_fee NUMERIC,
  ADD COLUMN IF NOT EXISTS service_fee NUMERIC,
  ADD COLUMN IF NOT EXISTS quoted_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS quote_status TEXT;

ALTER TABLE public.service_catalog
  ADD COLUMN IF NOT EXISTS pricing_mode TEXT NOT NULL DEFAULT 'fixed';