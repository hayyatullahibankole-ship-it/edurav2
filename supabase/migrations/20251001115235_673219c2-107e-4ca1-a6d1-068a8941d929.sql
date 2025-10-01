-- Fix RLS policies that cause read-only transaction errors
-- The issue is log_pii_access being called in USING expressions during SELECT

-- Drop all existing SELECT policies on users table
DROP POLICY IF EXISTS "Users can view own profile with audit" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile simple" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

-- Drop the problematic attempts policy
DROP POLICY IF EXISTS "Users can view own attempts with audit" ON public.attempts;

-- Recreate clean SELECT policies without any INSERT operations
CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth_user_id = auth.uid());

CREATE POLICY "Users can view own attempts"
ON public.attempts
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = attempts.user_id 
    AND users.auth_user_id = auth.uid()
));