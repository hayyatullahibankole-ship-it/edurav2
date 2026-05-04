-- Campus Hub: newsletter subscribers and consultation bookings
CREATE TABLE IF NOT EXISTS public.campus_hub_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text,
  whatsapp text,
  school text,
  level text,
  interests text[],
  created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.campus_hub_consultations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  whatsapp text not null,
  current_level text,
  target_school text,
  target_course text,
  jamb_score integer,
  message text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

ALTER TABLE public.campus_hub_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_hub_consultations ENABLE ROW LEVEL SECURITY;

-- Public can submit (insert) their info
CREATE POLICY "Public can subscribe"
  ON public.campus_hub_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can request consultation"
  ON public.campus_hub_consultations FOR INSERT
  WITH CHECK (true);

-- Admins can view (uses existing has_role function)
CREATE POLICY "Admins view subscribers"
  ON public.campus_hub_subscribers FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view consultations"
  ON public.campus_hub_consultations FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update consultations"
  ON public.campus_hub_consultations FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));
