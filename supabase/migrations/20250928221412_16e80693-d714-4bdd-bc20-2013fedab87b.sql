-- Security Enhancement Migration (Corrected)
-- Fix 1: Enhance Audit Log Security - Restrict audit log creation to system operations only
DROP POLICY IF EXISTS "System can create audit logs" ON public.audit_logs;

CREATE POLICY "Authenticated users can create audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (
  -- Only allow system functions or admin users to create audit logs
  (auth.uid() IS NOT NULL AND (
    -- Allow if it's an admin user
    is_admin(auth.uid())
    -- Or if it's being called from a security definer function (system operation)
    OR current_setting('role', true) = 'service_role'
  ))
);

-- Fix 2: Create function to return masked attempt data for students
CREATE OR REPLACE FUNCTION public.get_student_attempt_data(target_attempt_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  exam_id uuid,
  status attempt_status,
  selected_subjects jsonb,
  started_at timestamp with time zone,
  submitted_at timestamp with time zone,
  time_remaining_seconds integer,
  created_at timestamp with time zone,
  -- Sensitive fields are excluded or masked
  device_info text,  -- Masked version
  security_score integer -- Derived security score instead of raw tracking data
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_owns_attempt boolean;
  is_user_admin boolean;
BEGIN
  -- Check if the current user owns this attempt
  SELECT EXISTS (
    SELECT 1 FROM attempts a
    JOIN users u ON a.user_id = u.id
    WHERE a.id = target_attempt_id AND u.auth_user_id = auth.uid()
  ) INTO user_owns_attempt;
  
  -- Check if user is admin
  SELECT is_admin(auth.uid()) INTO is_user_admin;
  
  -- Only allow access if user owns the attempt or is admin
  IF NOT (user_owns_attempt OR is_user_admin) THEN
    RAISE EXCEPTION 'Access denied to attempt data';
  END IF;
  
  -- Return masked data for students, full data for admins
  RETURN QUERY
  SELECT 
    a.id,
    a.user_id,
    a.exam_id,
    a.status,
    a.selected_subjects,
    a.started_at,
    a.submitted_at,
    a.time_remaining_seconds,
    a.created_at,
    CASE 
      WHEN is_user_admin THEN 
        COALESCE('Device: ' || LEFT(a.device_fingerprint, 8) || '...', 'Unknown')
      ELSE 
        'Protected'
    END as device_info,
    CASE 
      WHEN is_user_admin THEN a.suspicious_activity_count
      WHEN a.suspicious_activity_count > 5 THEN 1  -- High risk
      WHEN a.suspicious_activity_count > 2 THEN 2  -- Medium risk  
      ELSE 3  -- Low risk
    END as security_score
  FROM attempts a
  WHERE a.id = target_attempt_id;
END;
$$;

-- Fix 3: Add rate limiting for critical authentication endpoints
CREATE OR REPLACE FUNCTION public.check_auth_rate_limit()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_ip inet;
  attempt_count integer;
BEGIN
  -- Get client IP
  current_ip := inet_client_addr();
  
  -- Count authentication attempts from this IP in last 15 minutes
  SELECT COUNT(*) INTO attempt_count
  FROM rate_limits
  WHERE endpoint = 'auth_attempt'
    AND created_at > now() - INTERVAL '15 minutes'
    AND (
      user_id = auth.uid() 
      OR details->>'ip_address' = current_ip::text
    );
  
  -- Allow max 5 attempts per 15 minutes
  IF attempt_count >= 5 THEN
    -- Log security event
    PERFORM log_security_event(
      'AUTH_RATE_LIMIT_EXCEEDED',
      'authentication',
      auth.uid(),
      jsonb_build_object(
        'ip_address', current_ip,
        'attempt_count', attempt_count,
        'window_minutes', 15
      )
    );
    RETURN false;
  END IF;
  
  -- Record this attempt
  INSERT INTO rate_limits (
    user_id, 
    endpoint, 
    request_count, 
    created_at,
    details
  ) VALUES (
    auth.uid(), 
    'auth_attempt', 
    1, 
    now(),
    jsonb_build_object('ip_address', current_ip)
  );
  
  RETURN true;
END;
$$;

-- Fix 4: Create function to validate admin actions with enhanced security
CREATE OR REPLACE FUNCTION public.validate_admin_action(action_type text, target_data jsonb DEFAULT '{}')
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user_id uuid;
  is_valid_admin boolean;
BEGIN
  -- Get the user ID from auth
  admin_user_id := auth.uid();
  
  -- Validate admin status
  SELECT is_admin(admin_user_id) INTO is_valid_admin;
  
  IF NOT is_valid_admin THEN
    -- Log unauthorized admin attempt
    PERFORM log_security_event(
      'UNAUTHORIZED_ADMIN_ATTEMPT',
      'admin_validation',
      admin_user_id,
      jsonb_build_object(
        'attempted_action', action_type,
        'target_data', target_data,
        'ip_address', inet_client_addr()
      )
    );
    RETURN false;
  END IF;
  
  -- Check rate limiting for admin actions (max 100 per hour)
  IF NOT check_rate_limit('admin_action', 100, 60) THEN
    RETURN false;
  END IF;
  
  -- Log valid admin action
  PERFORM log_admin_action(action_type, admin_user_id);
  
  RETURN true;
END;
$$;

-- Fix 5: Enhance user data access with additional security logging
CREATE OR REPLACE FUNCTION public.get_secure_user_data(target_user_id uuid)
RETURNS TABLE(
  id uuid,
  auth_user_id uuid,
  first_name varchar,
  last_name varchar,
  email text,
  phone text,
  country varchar,
  state varchar,
  is_verified boolean,
  is_suspended boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  last_login_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requesting_user_id uuid;
  is_admin_user boolean;
  can_access_full_data boolean;
BEGIN
  requesting_user_id := auth.uid();
  
  -- Check admin status
  SELECT is_admin(requesting_user_id) INTO is_admin_user;
  
  -- Check if user can access full data (own data or admin)
  SELECT can_view_full_pii(target_user_id) INTO can_access_full_data;
  
  -- Log access attempt
  PERFORM log_admin_pii_access(
    target_user_id, 
    'secure_user_data_access',
    ARRAY['profile', 'contact_info']
  );
  
  -- Return appropriate data based on permissions
  IF can_access_full_data THEN
    -- Return full data for authorized users
    RETURN QUERY
    SELECT 
      u.id, u.auth_user_id, u.first_name, u.last_name,
      u.email, u.phone, u.country, u.state,
      u.is_verified, u.is_suspended, u.created_at, u.updated_at,
      u.last_login_at
    FROM users u
    WHERE u.id = target_user_id;
  ELSE
    -- Return masked data for unauthorized access
    RETURN QUERY
    SELECT 
      u.id, u.auth_user_id, u.first_name, u.last_name,
      mask_email(u.email) as email, 
      mask_phone(u.phone) as phone,
      u.country, u.state, u.is_verified, u.is_suspended,
      u.created_at, u.updated_at, u.last_login_at
    FROM users u
    WHERE u.id = target_user_id;
  END IF;
END;
$$;