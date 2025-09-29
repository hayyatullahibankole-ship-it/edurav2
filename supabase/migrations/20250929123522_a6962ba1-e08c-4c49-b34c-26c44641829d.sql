-- Update Paystack public key with the live key
UPDATE public.system_settings 
SET value = 'pk_live_4be1a72db9986251078a2107f2963f95ee2576f1' 
WHERE key = 'paystack_public_key';