-- Final Security Fixes - Remove problematic security definer view

-- Remove the users_safe view that's causing security issues
DROP VIEW IF EXISTS public.users_safe;

-- Instead of a view, create a secure function for safe user data access
CREATE OR REPLACE FUNCTION public.get_user_safe_data(target_user_id uuid)
RETURNS TABLE (
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
SET search_path = public
AS $$
BEGIN
  -- Log PII access attempt
  PERFORM log_admin_pii_access(target_user_id, 'user_data_query');
  
  -- Check if user can access this data
  IF NOT (can_view_full_pii(target_user_id)) THEN
    -- Return masked data for non-authorized access
    RETURN QUERY
    SELECT 
      u.id,
      u.auth_user_id,
      u.first_name,
      u.last_name,
      mask_email(u.email) as email,
      mask_phone(u.phone) as phone,
      u.country,
      u.state,
      NULL::text as address,
      u.date_of_birth,
      u.profile_image_url,
      u.is_verified,
      u.is_suspended,
      u.created_at,
      u.updated_at
    FROM users u
    WHERE u.id = target_user_id;
  ELSE
    -- Return full data for authorized access
    RETURN QUERY
    SELECT 
      u.id,
      u.auth_user_id,
      u.first_name,
      u.last_name,
      u.email,
      u.phone,
      u.country,
      u.state,
      u.address,
      u.date_of_birth,
      u.profile_image_url,
      u.is_verified,
      u.is_suspended,
      u.created_at,
      u.updated_at
    FROM users u
    WHERE u.id = target_user_id;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_safe_data(uuid) TO authenticated;