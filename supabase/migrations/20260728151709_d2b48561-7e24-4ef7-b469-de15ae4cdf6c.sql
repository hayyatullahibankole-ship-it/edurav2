
-- 1. Ebook PDF support
ALTER TABLE public.ebooks ADD COLUMN IF NOT EXISTS pdf_path text;

-- 2. Email-based, device-locked access
ALTER TABLE public.ebook_access ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.ebook_access ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.ebook_access ADD COLUMN IF NOT EXISTS device_fingerprint text;
ALTER TABLE public.ebook_access ADD COLUMN IF NOT EXISTS device_locked_at timestamptz;
ALTER TABLE public.ebook_access ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS ebook_access_ebook_email_uidx
  ON public.ebook_access (ebook_id, lower(email)) WHERE email IS NOT NULL;

-- 3. Access check now also matches by email
CREATE OR REPLACE FUNCTION public.has_ebook_access(_ebook_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.ebook_access a
    WHERE a.ebook_id = _ebook_id
      AND (a.expires_at IS NULL OR a.expires_at > now())
      AND (
        a.user_id = _user_id
        OR lower(a.email) = (SELECT lower(u.email) FROM auth.users u WHERE u.id = _user_id)
      )
  ) OR public.is_ebook_admin(_user_id)
$function$;

-- 4. Admin grants access by email
CREATE OR REPLACE FUNCTION public.grant_ebook_access_by_email(_ebook_id uuid, _email text, _expires_at timestamptz DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_email text := lower(trim(_email));
  v_target uuid;
BEGIN
  IF v_uid IS NULL OR NOT public.is_ebook_admin(v_uid) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorised.');
  END IF;
  IF v_email IS NULL OR v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Enter a valid email address.');
  END IF;

  SELECT id INTO v_target FROM auth.users WHERE lower(email) = v_email LIMIT 1;

  INSERT INTO public.ebook_access (ebook_id, user_id, email, granted_by, source, expires_at)
  VALUES (_ebook_id, v_target, v_email, v_uid, 'admin', _expires_at)
  ON CONFLICT (ebook_id, lower(email)) WHERE email IS NOT NULL
  DO UPDATE SET user_id = COALESCE(public.ebook_access.user_id, EXCLUDED.user_id),
                expires_at = EXCLUDED.expires_at;

  RETURN jsonb_build_object('success', true, 'registered', v_target IS NOT NULL);
END;
$function$;

-- 5. Reader claims access on a single device
CREATE OR REPLACE FUNCTION public.claim_ebook_access(_ebook_id uuid, _fingerprint text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_email text;
  v_row public.ebook_access%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'signed_out');
  END IF;

  IF public.is_ebook_admin(v_uid) THEN
    RETURN jsonb_build_object('allowed', true, 'reason', 'admin');
  END IF;

  SELECT lower(email) INTO v_email FROM auth.users WHERE id = v_uid;

  SELECT * INTO v_row FROM public.ebook_access a
   WHERE a.ebook_id = _ebook_id
     AND (a.user_id = v_uid OR lower(a.email) = v_email)
   ORDER BY (a.user_id = v_uid) DESC
   LIMIT 1
   FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'no_access');
  END IF;
  IF v_row.expires_at IS NOT NULL AND v_row.expires_at <= now() THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'expired');
  END IF;

  IF v_row.device_fingerprint IS NOT NULL
     AND _fingerprint IS NOT NULL
     AND v_row.device_fingerprint <> _fingerprint THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'device_locked');
  END IF;

  UPDATE public.ebook_access
     SET user_id = COALESCE(user_id, v_uid),
         email = COALESCE(email, v_email),
         device_fingerprint = COALESCE(device_fingerprint, _fingerprint),
         device_locked_at = COALESCE(device_locked_at, CASE WHEN _fingerprint IS NOT NULL THEN now() END),
         last_seen_at = now()
   WHERE id = v_row.id;

  RETURN jsonb_build_object('allowed', true, 'reason', 'granted');
END;
$function$;

-- 6. Admin can reset a reader's device lock
CREATE OR REPLACE FUNCTION public.reset_ebook_device(_access_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_ebook_admin(auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorised.');
  END IF;
  UPDATE public.ebook_access
     SET device_fingerprint = NULL, device_locked_at = NULL
   WHERE id = _access_id;
  RETURN jsonb_build_object('success', true);
END;
$function$;

-- 7. Code redemption records the email too
CREATE OR REPLACE FUNCTION public.redeem_ebook_code(_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_row public.ebook_access_codes%ROWTYPE;
  v_slug text;
  v_email text;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'You must be signed in.');
  END IF;

  SELECT lower(email) INTO v_email FROM auth.users WHERE id = v_uid;

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

  INSERT INTO public.ebook_access (ebook_id, user_id, email, source)
  VALUES (v_row.ebook_id, v_uid, v_email, 'code')
  ON CONFLICT (ebook_id, user_id) DO NOTHING;

  UPDATE public.ebook_access_codes SET used_count = used_count + 1 WHERE id = v_row.id;

  SELECT slug INTO v_slug FROM public.ebooks WHERE id = v_row.ebook_id;
  RETURN jsonb_build_object('success', true, 'ebook_id', v_row.ebook_id, 'slug', v_slug);
END;
$function$;

-- 8. Storage policies
DROP POLICY IF EXISTS "akboy images readable" ON storage.objects;
CREATE POLICY "akboy images readable" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'akboy-images');

DROP POLICY IF EXISTS "akboy images admin write" ON storage.objects;
CREATE POLICY "akboy images admin write" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'akboy-images' AND public.is_ebook_admin(auth.uid()));

DROP POLICY IF EXISTS "akboy images admin update" ON storage.objects;
CREATE POLICY "akboy images admin update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'akboy-images' AND public.is_ebook_admin(auth.uid()));

DROP POLICY IF EXISTS "akboy images admin delete" ON storage.objects;
CREATE POLICY "akboy images admin delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'akboy-images' AND public.is_ebook_admin(auth.uid()));

DROP POLICY IF EXISTS "ebook files readable by granted users" ON storage.objects;
CREATE POLICY "ebook files readable by granted users" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'ebook-files'
    AND public.has_ebook_access(((storage.foldername(name))[1])::uuid, auth.uid())
  );

DROP POLICY IF EXISTS "ebook files admin write" ON storage.objects;
CREATE POLICY "ebook files admin write" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'ebook-files' AND public.is_ebook_admin(auth.uid()));

DROP POLICY IF EXISTS "ebook files admin update" ON storage.objects;
CREATE POLICY "ebook files admin update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'ebook-files' AND public.is_ebook_admin(auth.uid()));

DROP POLICY IF EXISTS "ebook files admin delete" ON storage.objects;
CREATE POLICY "ebook files admin delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'ebook-files' AND public.is_ebook_admin(auth.uid()));
