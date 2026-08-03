CREATE TABLE public.user_virtual_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  customer_code text,
  account_number text NOT NULL,
  account_name text NOT NULL,
  bank_name text NOT NULL,
  bank_slug text,
  currency text NOT NULL DEFAULT 'NGN',
  provider text NOT NULL DEFAULT 'paystack',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.user_virtual_accounts TO authenticated;
GRANT ALL ON public.user_virtual_accounts TO service_role;

ALTER TABLE public.user_virtual_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own virtual account"
ON public.user_virtual_accounts FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE TRIGGER update_user_virtual_accounts_updated_at
BEFORE UPDATE ON public.user_virtual_accounts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_user_virtual_accounts_account_number ON public.user_virtual_accounts(account_number);