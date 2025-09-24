-- Delete all user roles first (due to foreign key constraints)
DELETE FROM public.user_roles;

-- Delete all user profiles
DELETE FROM public.users;

-- Note: Auth users in the auth.users table will need to be deleted via the Supabase dashboard
-- or through the admin API, as they cannot be deleted via direct SQL from the public schema