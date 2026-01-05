-- Insert missing user profile for eduracbt@gmail.com
INSERT INTO public.users (auth_user_id, email, first_name, last_name, is_verified)
SELECT 
  '80a358a4-fa9d-4e24-87db-ad20c1b6be59'::uuid,
  'eduracbt@gmail.com',
  COALESCE((SELECT raw_user_meta_data->>'first_name' FROM auth.users WHERE id = '80a358a4-fa9d-4e24-87db-ad20c1b6be59'), 'Edura'),
  COALESCE((SELECT raw_user_meta_data->>'last_name' FROM auth.users WHERE id = '80a358a4-fa9d-4e24-87db-ad20c1b6be59'), 'User'),
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.users WHERE auth_user_id = '80a358a4-fa9d-4e24-87db-ad20c1b6be59'
);

-- Also create user preferences if missing
INSERT INTO public.user_preferences (user_id)
SELECT id FROM public.users WHERE auth_user_id = '80a358a4-fa9d-4e24-87db-ad20c1b6be59'
ON CONFLICT (user_id) DO NOTHING;