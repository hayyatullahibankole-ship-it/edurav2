ALTER TABLE public.service_catalog
  ADD COLUMN IF NOT EXISTS product_type text NOT NULL DEFAULT 'request',
  ADD COLUMN IF NOT EXISTS vendor_code text;

CREATE TABLE IF NOT EXISTS public.scratch_card_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  service_id uuid REFERENCES public.service_catalog(id) ON DELETE SET NULL,
  service_slug text NOT NULL,
  service_name text NOT NULL,
  provider text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  amount numeric NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'card',
  payment_reference text,
  status text NOT NULL DEFAULT 'pending',
  pins jsonb NOT NULL DEFAULT '[]'::jsonb,
  vendor_reference text,
  vendor_response jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.scratch_card_orders TO authenticated;
GRANT ALL ON public.scratch_card_orders TO service_role;

ALTER TABLE public.scratch_card_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own scratch card orders"
ON public.scratch_card_orders FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Users create own scratch card orders"
ON public.scratch_card_orders FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_scratch_card_orders_user ON public.scratch_card_orders(user_id, created_at DESC);

CREATE TRIGGER update_scratch_card_orders_updated_at
BEFORE UPDATE ON public.scratch_card_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.wallet_ensure(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_id uuid;
BEGIN
  SELECT id INTO v_id FROM public.user_wallets WHERE user_id = p_user_id;
  IF v_id IS NULL THEN
    INSERT INTO public.user_wallets (user_id, balance) VALUES (p_user_id, 0) RETURNING id INTO v_id;
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
    SELECT balance INTO v_after FROM public.user_wallets WHERE user_id = p_user_id;
    RETURN COALESCE(v_after, 0);
  END IF;

  v_wallet := public.wallet_ensure(p_user_id);

  SELECT balance INTO v_before FROM public.user_wallets WHERE id = v_wallet FOR UPDATE;
  v_after := COALESCE(v_before, 0) + p_amount;

  UPDATE public.user_wallets SET balance = v_after, updated_at = now() WHERE id = v_wallet;

  INSERT INTO public.wallet_transactions
    (wallet_id, transaction_type, amount, balance_before, balance_after, reference, description, metadata)
  VALUES (v_wallet, 'credit', p_amount, COALESCE(v_before, 0), v_after, p_reference, p_description, COALESCE(p_metadata, '{}'::jsonb));

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

  SELECT balance INTO v_before FROM public.user_wallets WHERE id = v_wallet FOR UPDATE;
  v_before := COALESCE(v_before, 0);

  IF v_before < p_amount THEN
    RAISE EXCEPTION 'Insufficient wallet balance';
  END IF;

  v_after := v_before - p_amount;

  UPDATE public.user_wallets SET balance = v_after, updated_at = now() WHERE id = v_wallet;

  INSERT INTO public.wallet_transactions
    (wallet_id, transaction_type, amount, balance_before, balance_after, reference, description, metadata)
  VALUES (v_wallet, 'debit', p_amount, v_before, v_after, p_reference, p_description, COALESCE(p_metadata, '{}'::jsonb));

  RETURN v_after;
END;
$$;

GRANT EXECUTE ON FUNCTION public.wallet_ensure(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.wallet_credit(uuid, numeric, text, text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.wallet_debit(uuid, numeric, text, text, jsonb) TO service_role;

DROP POLICY IF EXISTS "Users can view their own wallet" ON public.user_wallets;
CREATE POLICY "Users can view their own wallet"
ON public.user_wallets FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can view their own wallet transactions" ON public.wallet_transactions;
CREATE POLICY "Users can view their own wallet transactions"
ON public.wallet_transactions FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.user_wallets w WHERE w.id = wallet_transactions.wallet_id AND w.user_id = auth.uid())
  OR public.is_admin(auth.uid())
);

GRANT SELECT ON public.user_wallets TO authenticated;
GRANT SELECT ON public.wallet_transactions TO authenticated;
GRANT ALL ON public.user_wallets TO service_role;
GRANT ALL ON public.wallet_transactions TO service_role;