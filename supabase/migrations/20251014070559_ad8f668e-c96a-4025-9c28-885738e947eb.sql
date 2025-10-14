-- Fix Function Search Path Security Issue
-- All functions should have search_path set to prevent SQL injection

-- Update all existing functions to set search_path
ALTER FUNCTION public.validate_student_answer(uuid, jsonb) SET search_path = public;
ALTER FUNCTION public.is_admin(uuid) SET search_path = public;
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = public;
ALTER FUNCTION public.log_security_event(text, text, uuid, jsonb) SET search_path = public;
ALTER FUNCTION public.log_pii_access(uuid, text) SET search_path = public;

-- Move pg_cron extension from public to extensions schema if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron' AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    CREATE SCHEMA IF NOT EXISTS extensions;
    ALTER EXTENSION pg_cron SET SCHEMA extensions;
  END IF;
END $$;

-- Add email rate limiting function
CREATE OR REPLACE FUNCTION public.check_email_rate_limit(recipient_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  email_count integer;
BEGIN
  -- Count emails sent to this address in last hour
  SELECT COUNT(*) INTO email_count
  FROM audit_logs
  WHERE action_type = 'EMAIL_SENT'
    AND details->>'recipient' = recipient_email
    AND created_at > now() - INTERVAL '1 hour';
  
  -- Allow max 5 emails per hour per address
  IF email_count >= 5 THEN
    PERFORM log_security_event(
      'EMAIL_RATE_LIMIT_EXCEEDED',
      'email',
      NULL,
      jsonb_build_object(
        'recipient', recipient_email,
        'count', email_count
      )
    );
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Add account lockout after failed login attempts
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address inet,
  success boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage login attempts"
ON public.login_attempts
FOR ALL
USING (true);

-- Function to check if account is locked
CREATE OR REPLACE FUNCTION public.is_account_locked(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  failed_attempts integer;
BEGIN
  -- Count failed login attempts in last 15 minutes
  SELECT COUNT(*) INTO failed_attempts
  FROM login_attempts
  WHERE email = user_email
    AND success = false
    AND created_at > now() - INTERVAL '15 minutes';
  
  -- Lock account after 5 failed attempts
  IF failed_attempts >= 5 THEN
    PERFORM log_security_event(
      'ACCOUNT_LOCKED',
      'authentication',
      NULL,
      jsonb_build_object(
        'email', user_email,
        'failed_attempts', failed_attempts
      )
    );
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Function to record login attempt
CREATE OR REPLACE FUNCTION public.record_login_attempt(
  user_email text,
  attempt_success boolean,
  user_ip inet DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO login_attempts (email, ip_address, success, created_at)
  VALUES (user_email, COALESCE(user_ip, inet_client_addr()), attempt_success, now());
  
  -- Clean up old attempts (older than 24 hours)
  DELETE FROM login_attempts
  WHERE created_at < now() - INTERVAL '24 hours';
END;
$$;

-- Create email preferences table for unsubscribe functionality
CREATE TABLE IF NOT EXISTS public.email_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  welcome_emails boolean NOT NULL DEFAULT true,
  subscription_reminders boolean NOT NULL DEFAULT true,
  marketing_emails boolean NOT NULL DEFAULT true,
  product_updates boolean NOT NULL DEFAULT true,
  unsubscribe_token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own email preferences"
ON public.email_preferences
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = email_preferences.user_id
    AND u.auth_user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own email preferences"
ON public.email_preferences
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = email_preferences.user_id
    AND u.auth_user_id = auth.uid()
  )
);

CREATE POLICY "System can insert email preferences"
ON public.email_preferences
FOR INSERT
WITH CHECK (true);

-- Auto-create email preferences for new users
CREATE OR REPLACE FUNCTION public.create_email_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO email_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER create_email_preferences_on_user
AFTER INSERT ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.create_email_preferences();

-- Function to check if user wants specific email type
CREATE OR REPLACE FUNCTION public.can_send_email(
  target_user_id uuid,
  email_type text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prefs_enabled boolean;
BEGIN
  -- Check email preferences
  CASE email_type
    WHEN 'welcome' THEN
      SELECT welcome_emails INTO prefs_enabled
      FROM email_preferences
      WHERE user_id = target_user_id;
    WHEN 'subscription_reminder' THEN
      SELECT subscription_reminders INTO prefs_enabled
      FROM email_preferences
      WHERE user_id = target_user_id;
    WHEN 'marketing' THEN
      SELECT marketing_emails INTO prefs_enabled
      FROM email_preferences
      WHERE user_id = target_user_id;
    WHEN 'product_update' THEN
      SELECT product_updates INTO prefs_enabled
      FROM email_preferences
      WHERE user_id = target_user_id;
    ELSE
      prefs_enabled := true; -- Default allow for unknown types
  END CASE;
  
  RETURN COALESCE(prefs_enabled, true);
END;
$$;

-- Create email delivery log table
CREATE TABLE IF NOT EXISTS public.email_delivery_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  recipient_email text NOT NULL,
  email_type text NOT NULL,
  subject text,
  status text NOT NULL, -- 'sent', 'failed', 'bounced', 'complained'
  provider_message_id text,
  error_message text,
  sent_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.email_delivery_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email delivery logs"
ON public.email_delivery_log
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "System can insert email logs"
ON public.email_delivery_log
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_email_delivery_log_user_id ON public.email_delivery_log(user_id);
CREATE INDEX idx_email_delivery_log_created_at ON public.email_delivery_log(created_at);
CREATE INDEX idx_email_delivery_log_status ON public.email_delivery_log(status);
CREATE INDEX idx_login_attempts_email_created ON public.login_attempts(email, created_at);