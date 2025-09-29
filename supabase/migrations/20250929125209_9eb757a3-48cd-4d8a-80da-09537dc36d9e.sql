-- SECURITY FIX: Hide Paystack public key from public access
-- Update the system_settings table to secure payment configuration
UPDATE public.system_settings 
SET is_public = false 
WHERE key = 'paystack_public_key';

-- Add audit logging for payment configuration access
CREATE OR REPLACE FUNCTION public.audit_payment_config_access()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Log access to payment-related settings
  IF NEW.key LIKE '%paystack%' OR NEW.key LIKE '%payment%' OR NEW.key LIKE '%stripe%' THEN
    PERFORM log_security_event(
      'PAYMENT_CONFIG_ACCESS',
      'system_settings',
      NULL,
      jsonb_build_object(
        'setting_key', NEW.key,
        'action', TG_OP,
        'admin_user', auth.uid(),
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for payment configuration audit
DROP TRIGGER IF EXISTS audit_payment_config_trigger ON public.system_settings;
CREATE TRIGGER audit_payment_config_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.system_settings
  FOR EACH ROW 
  EXECUTE FUNCTION public.audit_payment_config_access();

-- Ensure only admins can access payment settings
CREATE POLICY "Admin only payment settings access" 
ON public.system_settings 
FOR SELECT 
USING (
  CASE 
    WHEN key LIKE '%paystack%' OR key LIKE '%payment%' OR key LIKE '%stripe%' THEN 
      is_admin(auth.uid())
    ELSE 
      is_public = true OR is_admin(auth.uid())
  END
);

-- Add rate limiting for sensitive operations
CREATE OR REPLACE FUNCTION public.check_admin_rate_limit()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_actions integer;
BEGIN
  -- Count admin actions in last 5 minutes
  SELECT COUNT(*) INTO recent_actions
  FROM audit_logs
  WHERE actor_user_id = auth.uid()
    AND action_type LIKE 'ADMIN_%'
    AND created_at > now() - INTERVAL '5 minutes';
  
  -- Allow max 50 admin actions per 5 minutes
  IF recent_actions >= 50 THEN
    PERFORM log_security_event(
      'ADMIN_RATE_LIMIT_EXCEEDED',
      'rate_limiting',
      auth.uid(),
      jsonb_build_object(
        'action_count', recent_actions,
        'window_minutes', 5
      )
    );
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Enhance user role validation with additional security checks
CREATE OR REPLACE FUNCTION public.validate_role_assignment(target_user_id uuid, role_to_assign app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requesting_user_role app_role;
  is_super_admin boolean;
BEGIN
  -- Check if requester is super admin
  SELECT has_role(auth.uid(), 'super_admin') INTO is_super_admin;
  
  -- Only super admins can assign admin or super_admin roles
  IF role_to_assign IN ('admin', 'super_admin') AND NOT is_super_admin THEN
    PERFORM log_security_event(
      'UNAUTHORIZED_ROLE_ASSIGNMENT',
      'user_roles',
      target_user_id,
      jsonb_build_object(
        'attempted_role', role_to_assign,
        'requester', auth.uid()
      )
    );
    RETURN false;
  END IF;
  
  -- Log successful role assignments
  PERFORM log_security_event(
    'ROLE_ASSIGNMENT',
    'user_roles',
    target_user_id,
    jsonb_build_object(
      'assigned_role', role_to_assign,
      'assigned_by', auth.uid()
    )
  );
  
  RETURN true;
END;
$$;

-- Add comprehensive security monitoring function
CREATE OR REPLACE FUNCTION public.monitor_security_events()
RETURNS TABLE(
  event_type text,
  event_count bigint,
  last_occurrence timestamp with time zone,
  severity text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    action_type as event_type,
    COUNT(*) as event_count,
    MAX(created_at) as last_occurrence,
    CASE 
      WHEN action_type LIKE '%UNAUTHORIZED%' THEN 'CRITICAL'
      WHEN action_type LIKE '%RATE_LIMIT%' THEN 'HIGH'
      WHEN action_type LIKE '%ADMIN_%' THEN 'MEDIUM'
      ELSE 'LOW'
    END as severity
  FROM audit_logs
  WHERE created_at > now() - INTERVAL '24 hours'
    AND action_type ~ '(UNAUTHORIZED|RATE_LIMIT|ADMIN_|PII_ACCESS|SECURITY)'
  GROUP BY action_type
  ORDER BY event_count DESC;
$$;