-- Create user record in public.users for akboysulekz@gmail.com
INSERT INTO public.users (id, auth_user_id, email, is_verified, is_suspended, two_fa_enabled, created_at, updated_at, country)
SELECT 
  gen_random_uuid(),
  au.id,
  au.email,
  true,
  false,
  false,
  now(),
  now(),
  'Nigeria'
FROM auth.users au
WHERE au.email = 'akboysulekz@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.users WHERE auth_user_id = au.id
  );

-- Add admin role for akboysulekz@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::app_role
FROM public.users u
WHERE u.email = 'akboysulekz@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;