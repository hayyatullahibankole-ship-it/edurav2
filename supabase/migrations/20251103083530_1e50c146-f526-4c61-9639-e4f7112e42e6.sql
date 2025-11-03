-- Create function to handle school admin registration
CREATE OR REPLACE FUNCTION public.handle_school_admin_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id uuid;
  school_admin_role_exists boolean;
BEGIN
  -- Check if this is a school admin based on metadata
  IF (NEW.raw_user_meta_data->>'role') = 'school_admin' THEN
    
    -- Insert into users table
    INSERT INTO public.users (auth_user_id, email, first_name, country, is_verified)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'full_name',
      'Nigeria',
      NEW.email_confirmed_at IS NOT NULL
    )
    RETURNING id INTO new_user_id;
    
    -- Check if school_admin role exists in app_role enum
    SELECT EXISTS (
      SELECT 1 FROM pg_enum 
      WHERE enumlabel = 'school_admin' 
      AND enumtypid = 'public.app_role'::regtype
    ) INTO school_admin_role_exists;
    
    -- If school_admin role doesn't exist, add it to the enum
    IF NOT school_admin_role_exists THEN
      ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'school_admin';
    END IF;
    
    -- Assign school_admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new_user_id, 'school_admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for school admin signup
DROP TRIGGER IF EXISTS on_school_admin_created ON auth.users;
CREATE TRIGGER on_school_admin_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_school_admin_signup();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.user_roles TO authenticated;
GRANT ALL ON public.schools TO authenticated;