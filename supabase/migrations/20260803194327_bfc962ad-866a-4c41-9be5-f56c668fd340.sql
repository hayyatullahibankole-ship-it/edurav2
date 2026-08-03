ALTER TABLE public.school_staff
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS invite_status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS invite_token text,
  ADD COLUMN IF NOT EXISTS invited_at timestamptz,
  ADD COLUMN IF NOT EXISTS accepted_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS school_staff_invite_token_key ON public.school_staff (invite_token) WHERE invite_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS school_staff_email_idx ON public.school_staff (lower(email));