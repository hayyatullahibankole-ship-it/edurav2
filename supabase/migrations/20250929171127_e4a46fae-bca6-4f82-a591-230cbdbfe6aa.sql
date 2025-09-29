-- Fix Paystack public key visibility
UPDATE system_settings 
SET is_public = true 
WHERE key = 'paystack_public_key';