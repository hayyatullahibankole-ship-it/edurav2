CREATE OR REPLACE FUNCTION public.redeem_ebook_code_for_device(_code text, _fingerprint text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.ebook_access_codes%ROWTYPE;
  v_slug text;
  v_ebook_id uuid;
BEGIN
  SELECT * INTO v_row
  FROM public.ebook_access_codes
  WHERE upper(trim(code)) = upper(trim(_code))
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

  SELECT id INTO v_ebook_id FROM public.ebooks WHERE id = v_row.ebook_id;
  IF v_ebook_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'This code does not belong to an active book.');
  END IF;

  INSERT INTO public.ebook_access (ebook_id, user_id, email, source, device_fingerprint, device_locked_at, last_seen_at)
  VALUES (v_row.ebook_id, NULL, NULL, 'code', _fingerprint, now(), now())
  ON CONFLICT (ebook_id, lower(email)) WHERE email IS NOT NULL DO NOTHING;

  INSERT INTO public.ebook_access (ebook_id, user_id, email, source, device_fingerprint, device_locked_at, last_seen_at)
  VALUES (v_row.ebook_id, NULL, NULL, 'code', _fingerprint, now(), now())
  ON CONFLICT (ebook_id, user_id) WHERE user_id IS NOT NULL DO NOTHING;

  UPDATE public.ebook_access_codes
  SET used_count = used_count + 1
  WHERE id = v_row.id;

  SELECT slug INTO v_slug FROM public.ebooks WHERE id = v_row.ebook_id;
  RETURN jsonb_build_object('success', true, 'ebook_id', v_row.ebook_id, 'slug', v_slug);
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_ebook_code_for_device(text, text) TO anon, authenticated;
