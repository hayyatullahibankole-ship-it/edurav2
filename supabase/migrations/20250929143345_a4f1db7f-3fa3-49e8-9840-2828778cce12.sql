-- Enhanced security for users table PII protection (Fixed version)
-- This migration improves RLS policies to better protect customer personal data

-- Drop existing policies that may have gaps
DROP POLICY IF EXISTS "Safe user view access" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;

-- Create enhanced RLS policies with proper PII protection and logging

-- 1. Users can only view their own profile with automatic PII access logging
CREATE POLICY "Users can view own profile with PII logging" ON public.users
FOR SELECT TO authenticated
USING (
  auth_user_id = auth.uid() 
  AND (SELECT log_pii_access(users.id, 'own_profile_view') IS NULL)
);

-- 2. Users can only update their own profile (excluding sensitive system fields)
CREATE POLICY "Users can update own profile safely" ON public.users
FOR UPDATE TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- 3. Admins can view all users with mandatory PII access logging
CREATE POLICY "Admins can view all users with PII logging" ON public.users
FOR SELECT TO authenticated
USING (
  is_admin(auth.uid())
  AND (SELECT log_pii_access(users.id, 'admin_user_view') IS NULL)
);

-- 4. Admins can update users
CREATE POLICY "Admins can update users safely" ON public.users
FOR UPDATE TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- 5. Prevent unauthorized user creation (only system can create via triggers)
CREATE POLICY "Only system can create users" ON public.users
FOR INSERT TO authenticated
WITH CHECK (
  -- Only allow if called from handle_new_user trigger or by super admin
  current_setting('role', true) = 'service_role' 
  OR has_role(auth.uid(), 'super_admin')
);

-- 6. Prevent unauthorized user deletion (only super admins)
CREATE POLICY "Only super admins can delete users" ON public.users
FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'super_admin'));

-- Create a secure view for masked user data (for admin interfaces that don't need full PII)
CREATE OR REPLACE VIEW public.users_masked AS
SELECT 
  u.id,
  u.auth_user_id,
  u.first_name,
  u.last_name,
  CASE 
    WHEN can_view_full_pii(u.id) THEN u.email
    ELSE mask_email(u.email)
  END as email,
  CASE 
    WHEN can_view_full_pii(u.id) THEN u.phone
    ELSE mask_phone(u.phone)
  END as phone,
  u.country,
  u.state,
  CASE 
    WHEN can_view_full_pii(u.id) THEN u.address
    ELSE NULL
  END as address,
  CASE 
    WHEN can_view_full_pii(u.id) THEN u.date_of_birth
    ELSE NULL
  END as date_of_birth,
  u.profile_image_url,
  u.is_verified,
  u.is_suspended,
  u.created_at,
  u.updated_at,
  CASE 
    WHEN is_admin(auth.uid()) THEN u.last_login_at
    ELSE NULL
  END as last_login_at,
  CASE 
    WHEN is_admin(auth.uid()) THEN LEFT(u.device_fingerprint, 8) || '...'
    ELSE NULL
  END as device_fingerprint_masked,
  CASE 
    WHEN is_admin(auth.uid()) THEN host(u.last_login_ip)
    ELSE NULL
  END as last_login_ip_masked
FROM public.users u;

-- Grant appropriate permissions
GRANT SELECT ON public.users_masked TO authenticated;

-- Create a function to safely retrieve user data with automatic logging
CREATE OR REPLACE FUNCTION public.get_user_secure(target_user_id uuid)
RETURNS TABLE(
  id uuid, 
  auth_user_id uuid, 
  first_name varchar, 
  last_name varchar, 
  email text, 
  phone text, 
  country varchar, 
  state varchar, 
  address text, 
  date_of_birth date, 
  profile_image_url text, 
  is_verified boolean, 
  is_suspended boolean, 
  created_at timestamptz, 
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log the access attempt
  PERFORM log_pii_access(target_user_id, 'secure_user_lookup');
  
  -- Return data based on permissions
  IF can_view_full_pii(target_user_id) THEN
    -- Full access for own data or admin
    RETURN QUERY
    SELECT u.id, u.auth_user_id, u.first_name, u.last_name, u.email, u.phone,
           u.country, u.state, u.address, u.date_of_birth, u.profile_image_url,
           u.is_verified, u.is_suspended, u.created_at, u.updated_at
    FROM users u WHERE u.id = target_user_id;
  ELSE
    -- Masked access for unauthorized users
    RETURN QUERY
    SELECT u.id, u.auth_user_id, u.first_name, u.last_name, 
           mask_email(u.email)::text as email, 
           mask_phone(u.phone)::text as phone,
           u.country, u.state, 
           NULL::text as address, 
           u.date_of_birth, 
           u.profile_image_url,
           u.is_verified, u.is_suspended, u.created_at, u.updated_at
    FROM users u WHERE u.id = target_user_id;
  END IF;
END;
$$;

-- Add trigger to prevent unauthorized modification of critical fields
CREATE OR REPLACE FUNCTION public.protect_user_critical_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Prevent modification of critical system fields by non-super-admins
  IF NOT has_role(auth.uid(), 'super_admin') THEN
    -- Preserve critical fields
    NEW.id = OLD.id;
    NEW.auth_user_id = OLD.auth_user_id;
    NEW.created_at = OLD.created_at;
    
    -- Log the update attempt
    PERFORM log_security_event(
      'USER_PROFILE_UPDATE',
      'users',
      NEW.id,
      jsonb_build_object(
        'updated_fields', jsonb_build_object(
          'first_name', CASE WHEN NEW.first_name != OLD.first_name THEN jsonb_build_object('old', OLD.first_name, 'new', NEW.first_name) ELSE null END,
          'last_name', CASE WHEN NEW.last_name != OLD.last_name THEN jsonb_build_object('old', OLD.last_name, 'new', NEW.last_name) ELSE null END,
          'email', CASE WHEN NEW.email != OLD.email THEN jsonb_build_object('old', mask_email(OLD.email), 'new', mask_email(NEW.email)) ELSE null END
        ),
        'updated_by', auth.uid()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER protect_user_fields_trigger
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_user_critical_fields();