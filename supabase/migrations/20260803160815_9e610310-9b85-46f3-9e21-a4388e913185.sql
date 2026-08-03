GRANT SELECT ON TABLE public.user_wallets TO authenticated;
GRANT SELECT ON TABLE public.wallet_transactions TO authenticated;
GRANT ALL ON TABLE public.user_wallets TO service_role;
GRANT ALL ON TABLE public.wallet_transactions TO service_role;