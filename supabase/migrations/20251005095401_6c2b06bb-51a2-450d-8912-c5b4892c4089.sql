-- First, update the paystack_public_key to be public
UPDATE system_settings 
SET is_public = true 
WHERE key = 'paystack_public_key';

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Public non-payment settings viewable by everyone" ON system_settings;

-- Create a better policy that allows public Paystack public key while protecting secrets
CREATE POLICY "Public settings and paystack public key viewable by everyone"
ON system_settings
FOR SELECT
USING (
  (is_public = true AND key = 'paystack_public_key') -- Allow Paystack public key specifically
  OR 
  (is_public = true AND 
   key !~~ '%secret%' AND 
   key !~~ '%private%' AND
   key !~~ '%paystack_secret%' AND
   key !~~ '%stripe_secret%')  -- Allow other public settings but block secrets
);

-- Ensure the admin policy still exists for full access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'system_settings' 
    AND policyname = 'Admins have full access to all settings'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins have full access to all settings"
    ON system_settings
    FOR ALL
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()))';
  END IF;
END $$;