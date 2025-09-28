-- Insert admin role for the user if it doesn't exist
INSERT INTO user_roles (user_id, role, assigned_by)
SELECT '0f185a85-478a-45ea-a4bd-816534bb0c02', 'admin'::app_role, '0f185a85-478a-45ea-a4bd-816534bb0c02'
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = '0f185a85-478a-45ea-a4bd-816534bb0c02'
);