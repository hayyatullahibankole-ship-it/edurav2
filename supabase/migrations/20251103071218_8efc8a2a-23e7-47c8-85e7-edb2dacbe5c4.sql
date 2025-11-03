-- Create helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_auth_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _auth_user_id
  LIMIT 1
$$;

-- Create trigger function to assign school_admin role when school is created
CREATE OR REPLACE FUNCTION public.handle_new_school()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Get the auth_user_id from the users table
  INSERT INTO public.user_roles (user_id, role)
  SELECT u.auth_user_id, 'school_admin'::app_role
  FROM users u
  WHERE u.id = NEW.admin_user_id
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_school_created ON public.schools;

-- Create trigger
CREATE TRIGGER on_school_created
  AFTER INSERT ON public.schools
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_school();