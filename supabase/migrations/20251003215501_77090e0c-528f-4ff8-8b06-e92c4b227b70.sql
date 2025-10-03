-- CRITICAL SECURITY FIX: Secure payment credentials
-- This migration fixes the exposure of live Paystack secret key

-- Step 1: Set is_public to false for ALL payment-related settings
UPDATE system_settings
SET is_public = false,
    updated_at = now()
WHERE key LIKE '%paystack%' 
   OR key LIKE '%payment%' 
   OR key LIKE '%stripe%'
   OR key LIKE '%secret%'
   OR key LIKE '%private%';

-- Step 2: Drop the overly permissive public policy
DROP POLICY IF EXISTS "Public settings are viewable by everyone" ON system_settings;

-- Step 3: Create a more secure policy that explicitly excludes payment settings
CREATE POLICY "Public non-payment settings viewable by everyone"
ON system_settings
FOR SELECT
TO public
USING (
  is_public = true 
  AND key NOT LIKE '%paystack%'
  AND key NOT LIKE '%payment%'
  AND key NOT LIKE '%stripe%'
  AND key NOT LIKE '%secret%'
  AND key NOT LIKE '%private%'
  AND key NOT LIKE '%key%'
);

-- Step 4: Ensure admin policy takes precedence and is comprehensive
DROP POLICY IF EXISTS "Admin only payment settings access" ON system_settings;
DROP POLICY IF EXISTS "Admins can manage all settings" ON system_settings;

CREATE POLICY "Admins have full access to all settings"
ON system_settings
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Step 5: Add audit trigger for payment settings access (if not exists)
DROP TRIGGER IF EXISTS audit_payment_config_access_trigger ON system_settings;

CREATE TRIGGER audit_payment_config_access_trigger
  AFTER INSERT OR UPDATE OR DELETE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION audit_payment_config_access();

-- Step 6: Log this critical security fix
DO $$
BEGIN
  PERFORM log_security_event(
    'CRITICAL_SECURITY_FIX',
    'system_settings',
    NULL,
    jsonb_build_object(
      'action', 'secured_payment_credentials',
      'description', 'Removed is_public flag from payment credentials',
      'affected_keys', (
        SELECT jsonb_agg(key) 
        FROM system_settings 
        WHERE key LIKE '%paystack%' OR key LIKE '%payment%'
      )
    )
  );
END $$;