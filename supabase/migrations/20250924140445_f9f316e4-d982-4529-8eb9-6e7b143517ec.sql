-- Assign admin role to the existing admin account
INSERT INTO public.user_roles (user_id, role, assigned_by, assigned_at)
SELECT 
  u.id,
  'admin'::app_role,
  u.id, -- self-assigned
  now()
FROM public.users u 
WHERE u.email = 'akboysulekz@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = u.id AND ur.role IN ('admin', 'super_admin')
);