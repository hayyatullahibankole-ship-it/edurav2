ALTER TABLE public.ebook_access
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS code_used text;

CREATE OR REPLACE FUNCTION public.redeem_ebook_code(_code text, _name text, _device text)
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
  v_name text := nullif(trim(coalesce(_name, '')), '');
  v_device text := nullif(trim(coalesce(_device, '')), '');
BEGIN
  IF v_name IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Please enter your full name.');
  END IF;

  IF v_uid IS NOT NULL THEN
    SELECT lower(email) INTO v_email FROM auth.users WHERE id = v_uid;
  END IF;

  SELECT * INTO v_row
  FROM public.ebook_access_codes
  WHERE upper(code) = upper(trim(_code))
  FOR UPDATE;

  IF NOT FOUND OR NOT v_row.is_active THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid access code.');
  END IF;

  IF v_row.expires_at IS NOT NULL AND v_row.expires_at <= now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'This access code has expired.');
  END IF;

  IF v_row.used_count >= v_row.max_uses THEN
    RETURN jsonb_build_object('success', false, 'error', 'This access code has reached its usage limit.');
  END IF;

  IF v_device IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.ebook_access
    WHERE ebook_id = v_row.ebook_id AND device_fingerprint = v_device
  ) THEN
    SELECT slug INTO v_slug FROM public.ebooks WHERE id = v_row.ebook_id;
    RETURN jsonb_build_object('success', true, 'ebook_id', v_row.ebook_id, 'slug', v_slug);
  END IF;

  INSERT INTO public.ebook_access (ebook_id, user_id, email, source, full_name, code_used, device_fingerprint, device_locked_at)
  VALUES (v_row.ebook_id, v_uid, v_email, 'code', v_name, upper(trim(_code)), v_device, CASE WHEN v_device IS NULL THEN NULL ELSE now() END)
  ON CONFLICT (ebook_id, user_id) WHERE user_id IS NOT NULL DO UPDATE
    SET full_name = EXCLUDED.full_name,
        code_used = EXCLUDED.code_used,
        device_fingerprint = COALESCE(public.ebook_access.device_fingerprint, EXCLUDED.device_fingerprint),
        device_locked_at = COALESCE(public.ebook_access.device_locked_at, EXCLUDED.device_locked_at);

  UPDATE public.ebook_access_codes
  SET used_count = used_count + 1
  WHERE id = v_row.id;

  SELECT slug INTO v_slug FROM public.ebooks WHERE id = v_row.ebook_id;
  RETURN jsonb_build_object('success', true, 'ebook_id', v_row.ebook_id, 'slug', v_slug);
END;
$function$;

GRANT EXECUTE ON FUNCTION public.redeem_ebook_code(text, text, text) TO anon, authenticated;