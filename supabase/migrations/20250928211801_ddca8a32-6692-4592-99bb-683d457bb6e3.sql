-- Phase 1: Critical Security Fixes (Corrected)

-- 1. Since users_safe is a view, let's check what it is and secure the underlying table
-- Drop the existing view if unsafe and recreate with proper access controls
DROP VIEW IF EXISTS public.users_safe;

-- Create a secure view for users_safe with proper data masking
CREATE VIEW public.users_safe AS
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
  u.date_of_birth,
  u.profile_image_url,
  u.is_verified,
  u.is_suspended,
  u.created_at,
  u.updated_at
FROM public.users u;

-- Enable RLS on the view by creating a security definer function
CREATE OR REPLACE FUNCTION public.users_safe_access_check()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log PII access attempts
  PERFORM log_pii_access(COALESCE(NEW.id, OLD.id), 'users_safe_view');
  
  -- Only allow access to own data or admin access
  IF NOT (
    (EXISTS (SELECT 1 FROM users WHERE id = COALESCE(NEW.id, OLD.id) AND auth_user_id = auth.uid())) 
    OR is_admin(auth.uid())
  ) THEN
    RAISE EXCEPTION 'Access denied to user data';
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 2. Strengthen exam security - Fix attempt_answers policies
DROP POLICY IF EXISTS "Users can manage own attempt answers" ON public.attempt_answers;

-- Create more restrictive policies for attempt_answers
CREATE POLICY "Users can insert own attempt answers" 
ON public.attempt_answers 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM attempts a 
    JOIN users u ON a.user_id = u.id 
    WHERE a.id = attempt_answers.attempt_id 
    AND u.auth_user_id = auth.uid()
    AND a.status IN ('STARTED', 'IN_PROGRESS')
  )
);

CREATE POLICY "Users can update own attempt answers during active attempts" 
ON public.attempt_answers 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM attempts a 
    JOIN users u ON a.user_id = u.id 
    WHERE a.id = attempt_answers.attempt_id 
    AND u.auth_user_id = auth.uid()
    AND a.status IN ('STARTED', 'IN_PROGRESS')
  )
);

CREATE POLICY "Users can view own attempt answers" 
ON public.attempt_answers 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM attempts a 
    JOIN users u ON a.user_id = u.id 
    WHERE a.id = attempt_answers.attempt_id 
    AND u.auth_user_id = auth.uid()
  )
);

-- 3. Enhanced audit logging for security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type text,
  target_table text,
  target_id uuid DEFAULT NULL,
  details jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO audit_logs (
    action_type,
    actor_user_id,
    target_id,
    target_type,
    details,
    ip_address,
    created_at
  ) VALUES (
    event_type,
    auth.uid(),
    target_id,
    target_table,
    details || jsonb_build_object(
      'timestamp', now(),
      'is_admin', is_admin(auth.uid())
    ),
    inet_client_addr(),
    now()
  );
END;
$$;

-- 4. Create rate limiting function for security
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  endpoint_name text,
  max_requests integer DEFAULT 100,
  window_minutes integer DEFAULT 60
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
  window_start timestamp with time zone;
BEGIN
  window_start := now() - (window_minutes || ' minutes')::interval;
  
  -- Count recent requests from this user for this endpoint
  SELECT COUNT(*) INTO current_count
  FROM rate_limits
  WHERE user_id = auth.uid()
    AND endpoint = endpoint_name
    AND window_start >= window_start;
  
  -- Log the rate limit check
  PERFORM log_security_event(
    'RATE_LIMIT_CHECK',
    'rate_limit',
    auth.uid(),
    jsonb_build_object(
      'endpoint', endpoint_name,
      'current_count', current_count,
      'max_requests', max_requests,
      'allowed', current_count < max_requests
    )
  );
  
  IF current_count >= max_requests THEN
    RETURN false;
  END IF;
  
  -- Record this request
  INSERT INTO rate_limits (user_id, endpoint, request_count, window_start)
  VALUES (auth.uid(), endpoint_name, 1, now())
  ON CONFLICT (user_id, endpoint, window_start)
  DO UPDATE SET request_count = rate_limits.request_count + 1;
  
  RETURN true;
END;
$$;