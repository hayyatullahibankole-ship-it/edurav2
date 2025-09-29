-- Fix RLS causing profile not visible and subscription showing as free

-- 1) Loosen audit_logs INSERT policy to allow logging from all authenticated users
DROP POLICY IF EXISTS "Authenticated users can create audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated users can create audit logs" 
ON public.audit_logs
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Keep existing SELECT policy for admins only (unchanged)

-- 2) Simplify users self-view policy to avoid logging in policy expression
DROP POLICY IF EXISTS "Users can view own profile with PII logging" ON public.users;
CREATE POLICY "Users can view own profile" 
ON public.users
FOR SELECT
USING (auth_user_id = auth.uid());

-- Keep admin policies and others unchanged
