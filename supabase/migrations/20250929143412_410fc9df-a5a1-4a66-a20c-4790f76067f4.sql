-- Fix security definer view warning by dropping it and using a secure function instead
DROP VIEW IF EXISTS public.users_masked;

-- Remove the security definer view and replace with a more secure function approach
-- This addresses the security linter warning about security definer views

-- Create an improved secure function that returns masked user data
CREATE OR REPLACE FUNCTION public.get_users_masked()
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
  updated_at timestamptz,
  last_login_at timestamptz,
  device_fingerprint_masked text,
  last_login_ip_masked text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only admins can view the masked user list
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: admin privileges required';
  END IF;

  -- Log admin access to user data
  PERFORM log_security_event(
    'ADMIN_USER_LIST_ACCESS',
    'users',
    null,
    jsonb_build_object(
      'admin_user', auth.uid(),
      'timestamp', now()
    )
  );

  RETURN QUERY
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
    u.last_login_at,
    CASE 
      WHEN is_admin(auth.uid()) THEN LEFT(u.device_fingerprint, 8) || '...'
      ELSE NULL
    END as device_fingerprint_masked,
    CASE 
      WHEN is_admin(auth.uid()) THEN host(u.last_login_ip)
      ELSE NULL
    END as last_login_ip_masked
  FROM public.users u;
END;
$$;