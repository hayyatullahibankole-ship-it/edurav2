-- Fix conflicting triggers by updating handle_school_admin_signup
-- to only assign role, not create user (handle_new_user already does that)

DROP TRIGGER IF EXISTS on_school_admin_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_school_admin_signup();

-- Create improved function that only assigns role to existing user
CREATE OR REPLACE FUNCTION public.handle_school_admin_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  app_user_id uuid;
BEGIN
  -- Check if this is a school admin based on metadata
  IF (NEW.raw_user_meta_data->>'role') = 'school_admin' THEN
    
    -- Wait a moment for handle_new_user to create the user record
    -- (it runs AFTER INSERT as well)
    PERFORM pg_sleep(0.1);
    
    -- Get the app user_id
    SELECT id INTO app_user_id
    FROM public.users
    WHERE auth_user_id = NEW.id;
    
    -- If user exists, assign school_admin role
    IF app_user_id IS NOT NULL THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (app_user_id, 'school_admin'::app_role)
      ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for school admin role assignment
-- This runs AFTER handle_new_user creates the user
CREATE TRIGGER on_school_admin_role_assignment
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_school_admin_role();