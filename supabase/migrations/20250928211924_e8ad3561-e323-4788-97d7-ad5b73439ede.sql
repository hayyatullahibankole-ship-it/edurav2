-- Simplified Security Enhancement Migration
-- Remove problematic trigger approach and use simpler security measures

-- Remove any existing problematic functions
DROP FUNCTION IF EXISTS public.secure_user_access();

-- Enhanced rate limiting and security functions
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
    AND created_at >= window_start;
  
  IF current_count >= max_requests THEN
    -- Log rate limit violation
    PERFORM log_security_event(
      'RATE_LIMIT_EXCEEDED',
      'rate_limit',
      auth.uid(),
      jsonb_build_object(
        'endpoint', endpoint_name,
        'current_count', current_count,
        'max_requests', max_requests
      )
    );
    RETURN false;
  END IF;
  
  -- Record this request
  INSERT INTO rate_limits (user_id, endpoint, request_count, window_start, created_at)
  VALUES (auth.uid(), endpoint_name, 1, window_start, now());
  
  RETURN true;
END;
$$;

-- Add constraint to ensure proper rate limit tracking
ALTER TABLE public.rate_limits 
DROP CONSTRAINT IF EXISTS rate_limits_user_endpoint_window_unique;

-- Create a unique index instead for better performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint_time 
ON public.rate_limits (user_id, endpoint, window_start);

-- Enhanced security logging function
CREATE OR REPLACE FUNCTION public.log_admin_pii_access(
  target_user_id uuid,
  access_type text,
  accessed_fields text[] DEFAULT ARRAY[]::text[]
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log admin access to other users' PII
  IF is_admin(auth.uid()) AND target_user_id != auth.uid() THEN
    PERFORM log_security_event(
      'ADMIN_PII_ACCESS',
      'user_data',
      target_user_id,
      jsonb_build_object(
        'access_type', access_type,
        'accessed_fields', accessed_fields,
        'admin_user', auth.uid(),
        'ip_address', inet_client_addr()
      )
    );
  END IF;
END;
$$;