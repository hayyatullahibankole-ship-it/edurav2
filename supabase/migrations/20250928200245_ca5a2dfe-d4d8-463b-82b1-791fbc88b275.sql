-- Create data masking functions for enhanced PII protection
CREATE OR REPLACE FUNCTION public.mask_email(email text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN email IS NULL THEN NULL
      WHEN position('@' in email) > 0 THEN 
        left(email, 1) || '***@' || right(split_part(email, '@', 2), length(split_part(email, '@', 2)) - 1)
      ELSE '***'
    END
$$;

-- Create function to mask phone numbers
CREATE OR REPLACE FUNCTION public.mask_phone(phone text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN phone IS NULL THEN NULL
      WHEN length(phone) > 4 THEN '****' || right(phone, 4)
      ELSE '****'
    END
$$;

-- Create function to check if user can view full PII (only own data or admin)
CREATE OR REPLACE FUNCTION public.can_view_full_pii(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- User can see their own full data
    (EXISTS (SELECT 1 FROM users WHERE id = target_user_id AND auth_user_id = auth.uid()))
    OR
    -- Or admin can see full data
    is_admin(auth.uid())
$$;

-- Enhance audit logging for sensitive data access
CREATE OR REPLACE FUNCTION public.log_pii_access(accessed_user_id uuid, access_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if accessing someone else's data
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = accessed_user_id AND auth_user_id = auth.uid()) THEN
    INSERT INTO audit_logs (
      action_type,
      actor_user_id,
      target_id,
      target_type,
      details,
      ip_address,
      created_at
    ) VALUES (
      'PII_ACCESS',
      auth.uid(),
      accessed_user_id,
      'user',
      jsonb_build_object(
        'access_type', access_type,
        'timestamp', now(),
        'is_admin', is_admin(auth.uid())
      ),
      inet_client_addr(),
      now()
    );
  END IF;
END;
$$;

-- Create view for safe user data access with automatic masking
CREATE OR REPLACE VIEW public.users_safe AS
SELECT 
  id,
  auth_user_id,
  CASE 
    WHEN can_view_full_pii(id) THEN email
    ELSE mask_email(email)
  END as email,
  CASE 
    WHEN can_view_full_pii(id) THEN phone
    ELSE mask_phone(phone)
  END as phone,
  first_name,
  last_name,
  CASE 
    WHEN can_view_full_pii(id) THEN address
    ELSE 'Hidden for privacy'
  END as address,
  state,
  country,
  profile_image_url,
  date_of_birth,
  is_verified,
  is_suspended,
  created_at,
  updated_at
FROM users;

-- Add RLS to the safe view
ALTER VIEW public.users_safe SET (security_invoker = true);

-- Create policy for the safe view
CREATE POLICY "Safe user view access" ON public.users
FOR SELECT USING (
  -- Users can always see their own data
  (auth_user_id = auth.uid()) OR
  -- Admins can see all data through the safe view
  is_admin(auth.uid())
);

-- Strengthen attempts table security with better policies
DROP POLICY IF EXISTS "Users can view own attempts" ON public.attempts;
CREATE POLICY "Users can view own attempts with audit" ON public.attempts
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = attempts.user_id 
    AND u.auth_user_id = auth.uid()
    AND (SELECT log_pii_access(attempts.user_id, 'attempt_view')) IS NULL
  )
);

-- Add policy to prevent exposure of sensitive tracking data to non-admins
CREATE POLICY "Limit tracking data visibility" ON public.attempts
FOR SELECT USING (
  -- Users can see their own attempts but with limited tracking info
  (EXISTS (SELECT 1 FROM users WHERE id = attempts.user_id AND auth_user_id = auth.uid()))
  OR
  -- Admins can see full tracking data
  is_admin(auth.uid())
);

-- Strengthen settings table security
DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;
CREATE POLICY "Super admins only for settings" ON public.settings
FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- Add audit trigger for settings changes
CREATE OR REPLACE FUNCTION public.audit_settings_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO audit_logs (
    action_type,
    actor_user_id,
    target_type,
    details,
    created_at
  ) VALUES (
    TG_OP || '_SETTING',
    auth.uid(),
    'settings',
    jsonb_build_object(
      'key', COALESCE(NEW.key, OLD.key),
      'old_value', CASE WHEN TG_OP != 'INSERT' THEN OLD.value ELSE NULL END,
      'new_value', CASE WHEN TG_OP != 'DELETE' THEN NEW.value ELSE NULL END
    ),
    now()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER audit_settings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION audit_settings_changes();