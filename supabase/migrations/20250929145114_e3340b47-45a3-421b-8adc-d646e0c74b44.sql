-- Enable leaked password protection in Supabase Auth settings
-- This SQL is for documentation purposes - the actual setting needs to be enabled in the dashboard

-- Log this security configuration change
INSERT INTO audit_logs (
  action_type,
  target_type,
  details,
  created_at
) VALUES (
  'SECURITY_CONFIG_LEAKED_PASSWORD_PROTECTION',
  'auth_settings',
  jsonb_build_object(
    'description', 'Leaked password protection should be enabled in Auth settings',
    'dashboard_url', 'https://supabase.com/dashboard/project/zqapbmllkywsuywpfava/auth/providers',
    'instructions', 'Enable leaked password protection in Authentication > Settings > Password Protection'
  ),
  now()
);