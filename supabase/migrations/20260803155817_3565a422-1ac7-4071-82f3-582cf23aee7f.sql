CREATE OR REPLACE FUNCTION public.wallet_resolve_user_id(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_public_user_id uuid;
BEGIN
  SELECT u.id
  INTO v_public_user_id
  FROM public.users u
  WHERE u.id = p_user_id OR u.auth_user_id = p_user_id
  ORDER BY CASE WHEN u.auth_user_id = p_user_id THEN 0 ELSE 1 END
  LIMIT 1;

  IF v_public_user_id IS NULL THEN
    RAISE EXCEPTION 'No public user profile exists for this account';
  END IF;

  RETURN v_public_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.wallet_resolve_user_id(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.wallet_resolve_user_id(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.wallet_ensure(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_public_user_id uuid;
BEGIN
  v_public_user_id := public.wallet_resolve_user_id(p_user_id);

  SELECT id INTO v_id
  FROM public.user_wallets
  WHERE user_id = v_public_user_id;

  IF v_id IS NULL THEN
    INSERT INTO public.user_wallets (user_id, balance)
    VALUES (v_public_user_id, 0)
    RETURNING id INTO v_id;
  END IF;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.wallet_credit(
  p_user_id uuid,
  p_amount numeric,
  p_reference text,
  p_description text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet uuid;
  v_before numeric;
  v_after numeric;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than zero';
  END IF;

  IF p_reference IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.wallet_transactions WHERE reference = p_reference
  ) THEN
    SELECT w.balance INTO v_after
    FROM public.user_wallets w
    WHERE w.id = public.wallet_ensure(p_user_id);
    RETURN COALESCE(v_after, 0);
  END IF;

  v_wallet := public.wallet_ensure(p_user_id);

  SELECT balance INTO v_before
  FROM public.user_wallets
  WHERE id = v_wallet
  FOR UPDATE;

  v_after := COALESCE(v_before, 0) + p_amount;

  UPDATE public.user_wallets
  SET balance = v_after, updated_at = now()
  WHERE id = v_wallet;

  INSERT INTO public.wallet_transactions
    (wallet_id, transaction_type, amount, balance_before, balance_after, reference, description, metadata)
  VALUES
    (v_wallet, 'credit', p_amount, COALESCE(v_before, 0), v_after, p_reference, p_description, COALESCE(p_metadata, '{}'::jsonb));

  RETURN v_after;
END;
$$;

CREATE OR REPLACE FUNCTION public.wallet_debit(
  p_user_id uuid,
  p_amount numeric,
  p_reference text,
  p_description text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet uuid;
  v_before numeric;
  v_after numeric;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than zero';
  END IF;

  v_wallet := public.wallet_ensure(p_user_id);

  SELECT balance INTO v_before
  FROM public.user_wallets
  WHERE id = v_wallet
  FOR UPDATE;

  v_before := COALESCE(v_before, 0);
  IF v_before < p_amount THEN
    RAISE EXCEPTION 'Insufficient wallet balance';
  END IF;

  v_after := v_before - p_amount;

  UPDATE public.user_wallets
  SET balance = v_after, updated_at = now()
  WHERE id = v_wallet;

  INSERT INTO public.wallet_transactions
    (wallet_id, transaction_type, amount, balance_before, balance_after, reference, description, metadata)
  VALUES
    (v_wallet, 'debit', p_amount, v_before, v_after, p_reference, p_description, COALESCE(p_metadata, '{}'::jsonb));

  RETURN v_after;
END;
$$;