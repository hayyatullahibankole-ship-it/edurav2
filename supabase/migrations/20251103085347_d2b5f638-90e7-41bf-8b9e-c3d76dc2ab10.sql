-- Drop the separate school admin role trigger
DROP TRIGGER IF EXISTS on_school_admin_role_assignment ON auth.users;
DROP FUNCTION IF EXISTS public.handle_school_admin_role();

-- Update handle_new_user to handle school admin role assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Insert user profile
  INSERT INTO public.users (
    auth_user_id,
    email,
    first_name,
    last_name,
    phone,
    is_verified
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'phone',
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
  )
  ON CONFLICT (auth_user_id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    is_verified = EXCLUDED.is_verified
  RETURNING id INTO new_user_id;
  
  -- Get the user ID if it was an update
  IF new_user_id IS NULL THEN
    SELECT id INTO new_user_id FROM public.users WHERE auth_user_id = NEW.id;
  END IF;
  
  -- Create default user preferences only if they don't exist
  INSERT INTO public.user_preferences (user_id)
  VALUES (new_user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- If this is a school admin, assign the role
  IF (NEW.raw_user_meta_data->>'role') = 'school_admin' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new_user_id, 'school_admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth process
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;